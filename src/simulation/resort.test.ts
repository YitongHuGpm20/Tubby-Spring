import test from "node:test";
import assert from "node:assert/strict";
import {
  Resort,
  WORLD_WIDTH,
  WORLD_HEIGHT,
  START_OFFSET_X,
  START_OFFSET_Y,
} from "./resort";
function run(world: Resort, seconds: number): void {
  for (let i = 0; i < seconds * 10; i++) world.step(0.1);
}
test("construction checks available funds, bounds and spacing without charging rejected placements", () => {
  const w = new Resort();
  const coins = w.coins;
  assert.match(
    w.build("lodge", 700 + START_OFFSET_X, 430 + START_OFFSET_Y),
    /breathing/,
  );
  assert.equal(w.coins, coins);
  assert.match(w.build("lodge", NaN, 200), /boundary/);
  assert.equal(w.coins, coins);
  assert.match(w.build("lodge", 450, 300), /Built/);
  assert.equal(w.coins, coins - 160);
  assert.equal(w.facilities.at(-1)?.kind, "lodge");
  w.coins = 0;
  const count = w.facilities.length;
  assert.match(w.build("spring", 950, 660), /Not enough/);
  assert.equal(w.facilities.length, count);
  assert.equal(w.coins, 0);
});
test("autonomous resort run earns service income, queues within capacity, grows gardens and completes guest stays", () => {
  const w = new Resort();
  w.build("lodge", 430, 300);
  let served = 0;
  for (let i = 0; i < 6000; i++) {
    w.step(0.1);
    for (const f of w.facilities) {
      assert.ok(w.occupancy(f) <= w.capacityOf(f));
      assert.ok(f.cleanliness >= 0 && f.cleanliness <= 100);
    }
    assert.ok(w.coins >= 0);
    served = w.facilities.reduce((n, f) => n + f.served, 0);
  }
  assert.ok(served > 15);
  assert.ok(w.income > 150);
  assert.ok(w.expenses > 0);
  assert.ok(w.departed > 0);
  assert.ok(w.gardenScore >= 100);
  assert.ok(w.milestones.has("garden"));
});
test("pause freezes money, visitors, weather and animation clock", () => {
  const w = new Resort();
  w.paused = true;
  const before = JSON.stringify(w.snapshot());
  run(w, 120);
  assert.equal(JSON.stringify(w.snapshot()), before);
});
test("save restore retains economy, autonomous guest state and deterministic continuation", () => {
  const w = new Resort();
  run(w, 40);
  const restored = new Resort(JSON.parse(JSON.stringify(w.snapshot())));
  assert.deepEqual(restored.snapshot(), w.snapshot());
  run(w, 15);
  run(restored, 15);
  assert.deepEqual(restored.snapshot(), w.snapshot());
});
test("corrupted save falls back to a viable fresh resort", () => {
  for (const data of [
    null,
    {},
    { version: 1, facilities: [], guests: [] },
    { ...new Resort().snapshot(), coins: NaN },
    { ...new Resort().snapshot(), guests: [{ kind: "alien" }] },
  ]) {
    const w = new Resort(data);
    assert.equal(w.facilities.length, 3);
    assert.equal(w.guests.length, 4);
    assert.ok(Number.isFinite(w.coins));
  }
});
test("cleaning, upgrades and parties spend once and never permit a negative balance", () => {
  const w = new Resort(),
    f = w.facilities[0];
  f.cleanliness = 35;
  const before = w.coins;
  w.clean(f.id);
  assert.equal(f.cleanliness, 100);
  assert.equal(w.coins, before - 8);
  w.clean(f.id);
  assert.equal(w.coins, before - 8);
  w.coins = 0;
  const level = f.level;
  w.upgrade(f.id);
  assert.equal(f.level, level);
  w.hostEvent();
  assert.equal(w.coins, 0);
});
test("no services double-charge while a guest remains in the same activity", () => {
  const w = new Resort();
  w.guests = [w.guests[0]];
  const g = w.guests[0];
  g.state = "walking";
  g.facilityId = w.facilities[0].id;
  g.x = g.targetX = w.facilities[0].x;
  g.y = g.targetY = w.facilities[0].y + 75;
  const before = w.income;
  w.step(0.1);
  assert.equal(w.income, before + 16);
  run(w, 2);
  assert.equal(w.income, before + 16);
});

test("pricing trades service yield for guest attraction and survives save restore", () => {
  const w = new Resort();
  const f = w.facilities[0];
  w.setPricing("friendly");
  assert.equal(w.fee(f), 12);
  assert.equal(w.entryFee, 6);
  w.setPricing("premium");
  assert.equal(w.fee(f), 20);
  assert.equal(w.entryFee, 10);
  const restored = new Resort(w.snapshot());
  assert.equal(restored.pricing, "premium");
  assert.equal(restored.fee(restored.facilities[0]), 20);
});

test("expanded meadows support construction and preserve distant facilities in saves", () => {
  const world = new Resort();
  world.coins = 1000;
  assert.match(
    world.build("lodge", WORLD_WIDTH - 300, WORLD_HEIGHT - 300),
    /Built/,
  );
  const restored = new Resort(world.snapshot());
  assert.equal(restored.facilities.at(-1)?.x, WORLD_WIDTH - 300);
  assert.equal(restored.facilities.at(-1)?.y, WORLD_HEIGHT - 300);
  const coins = world.coins;
  assert.match(
    world.build("garden", WORLD_WIDTH - 20, WORLD_HEIGHT - 300),
    /boundary/,
  );
  assert.equal(world.coins, coins);
});
