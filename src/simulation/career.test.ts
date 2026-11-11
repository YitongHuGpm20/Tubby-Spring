import test from "node:test";
import assert from "node:assert/strict";
import { Resort, START_OFFSET_X, START_OFFSET_Y } from "./resort";
import { CHAPTERS } from "./progression";

test("legacy coordinates migrate once while money and guest destinations survive", () => {
  const original = new Resort();
  const legacy = original.snapshot();
  legacy.version = 1;
  delete legacy.progression;
  legacy.facilities = structuredClone(legacy.facilities);
  legacy.guests = structuredClone(legacy.guests);
  for (const f of legacy.facilities) {
    f.x -= START_OFFSET_X;
    f.y -= START_OFFSET_Y;
  }
  for (const g of legacy.guests) {
    g.x -= START_OFFSET_X;
    g.y -= START_OFFSET_Y;
    g.targetX -= START_OFFSET_X;
    g.targetY -= START_OFFSET_Y;
  }
  const migrated = new Resort(legacy);
  assert.deepEqual(migrated.facilities, original.facilities);
  assert.deepEqual(migrated.guests, original.guests);
  assert.equal(migrated.coins, original.coins);
  const again = new Resort(migrated.snapshot());
  assert.deepEqual(again.snapshot(), migrated.snapshot());
  assert.equal(migrated.facilities[0].x, 2100);
});
test("commissions rotate, cannot be claimed twice and their rewards do not count as revenue", () => {
  const w = new Resort();
  const task = w.progression.contracts[0];
  w.facilities[0].served = task.target;
  const income = w.income;
  const coins = w.coins;
  assert.match(w.claimContract(task.id), /Commission complete/);
  assert.equal(w.coins, coins + task.coins);
  assert.equal(w.income, income);
  assert.equal(w.progression.completed, 1);
  assert.equal(w.progression.contracts.length, 3);
  assert.equal(
    w.progression.contracts.some((c) => c.id === task.id),
    false,
  );
  const after = JSON.stringify(w.snapshot());
  assert.match(w.claimContract(task.id), /in progress/);
  assert.equal(JSON.stringify(w.snapshot()), after);
  const restored = new Resort(w.snapshot());
  assert.deepEqual(restored.snapshot(), w.snapshot());
});
test("achievements pay once and chapters require both work and completed commissions", () => {
  const w = new Resort();
  w.progression.xp = CHAPTERS[7].xp;
  assert.equal(w.rank, 0);
  w.progression.completed = CHAPTERS[7].tasks;
  assert.equal(w.rank, 7);
  w.facilities[0].served = 100;
  w.step(1.1);
  assert.ok(w.progression.achievements.includes("services-0"));
  const stamps = w.progression.stamps;
  w.step(1.1);
  assert.equal(w.progression.stamps, stamps);
});
test("research, caretakers and advanced upgrades survive saves and respect costs", () => {
  const w = new Resort();
  assert.match(w.research("rooms"), /chapter/);
  w.progression.xp = 70000;
  w.progression.completed = 150;
  w.coins = 500000;
  w.progression.stamps = 200;
  assert.match(w.research("care"), /researched/);
  assert.match(w.hireCaretaker(), /hired/);
  assert.match(w.research("rooms"), /researched/);
  assert.match(w.research("deluxe"), /researched/);
  assert.equal(w.maxLevel, 5);
  const f = w.facilities[0];
  while (f.level < 5) w.upgrade(f.id);
  const coins = w.coins;
  assert.match(w.upgrade(f.id), /Research/);
  assert.equal(w.coins, coins);
  f.cleanliness = 10;
  w.step(2);
  for (let i = 0; i < 30; i++) w.step(2);
  assert.ok(f.cleanliness > 80);
  assert.ok(w.progression.cleaned > 0);
  assert.equal(new Resort(w.snapshot()).maxLevel, 5);
  assert.equal(new Resort(w.snapshot()).progression.staff, 1);
});
test("malformed progression regenerates a usable board without discarding a valid resort", () => {
  const w = new Resort();
  w.coins = 987;
  const saved = w.snapshot();
  saved.progression!.contracts[0].target = NaN;
  const restored = new Resort(saved);
  assert.equal(restored.coins, 987);
  assert.equal(restored.progression.contracts.length, 3);
  assert.ok(
    restored.progression.contracts.every((c) => Number.isFinite(c.target)),
  );
});

test("meadow themes cost stamps, improve matching facilities and preserve their level when changed", () => {
  const w = new Resort();
  w.progression.xp = 140000;
  w.progression.completed = 300;
  w.coins = 500000;
  w.progression.stamps = 200;
  const f = w.facilities[0];
  const capacity = w.capacityOf(f),
    fee = w.fee(f);
  assert.match(w.developDistrict(4, "spring"), /level 1/);
  assert.equal(w.capacityOf(f), capacity + 1);
  assert.ok(w.fee(f) > fee);
  w.developDistrict(4, "spring");
  w.developDistrict(4, "spring");
  assert.equal(w.progression.districts[4].level, 3);
  const coins = w.coins;
  w.developDistrict(4, "spring");
  assert.equal(w.coins, coins);
  w.developDistrict(4, "cafe");
  assert.equal(w.progression.districts[4].level, 3);
  assert.equal(w.capacityOf(f), capacity);
  assert.deepEqual(
    new Resort(w.snapshot()).progression.districts,
    w.progression.districts,
  );
});
