import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import {
  Resort,
  FACILITIES,
  type FacilityKind,
} from "../src/simulation/resort";
import { CHAPTERS, RESEARCH } from "../src/simulation/progression";
let w = new Resort();
const report: object[] = [];
const chapterTimes: (number | null)[] = [0, ...Array(7).fill(null)];
let maxId = 0;
let claims = 0;
const candidates: [number, number][] = [];
// First build near the center, then branch into the eight surrounding districts.
for (let y = 1080; y <= 1900; y += 220)
  for (let x = 1650; x <= 2750; x += 220) candidates.push([x, y]);
for (let row = 0; row < 3; row++)
  for (let col = 0; col < 3; col++)
    if (row !== 1 || col !== 1)
      candidates.push([col * 1400 + 700, row * 950 + 475]);
let point = 0;
function build(kind: FacilityKind) {
  while (point < candidates.length) {
    const [x, y] = candidates[point++];
    const before = w.facilities.length;
    w.build(kind, x, y);
    if (w.facilities.length > before) return;
  }
}
function manage() {
  for (const f of w.facilities) if (f.cleanliness < 60) w.clean(f.id);
  if (w.milestones.size === 5 && !w.progression.tutorialClaimed)
    w.claimTutorial();
  for (const item of RESEARCH)
    if (
      !w.hasResearch(item.id) &&
      w.coins > item.coins + 300 &&
      w.progression.stamps >= item.stamps &&
      w.rank >= item.rank
    )
      w.research(item.id);
  if (
    w.hasResearch("care") &&
    w.progression.staff < Math.min(8, Math.ceil(w.facilities.length / 3)) &&
    w.coins > 600
  )
    w.hireCaretaker();
  if (!w.facilities.some((f) => f.kind === "lodge") && w.coins > 250)
    build("lodge");
  for (const c of [...w.progression.contracts]) {
    if (w.contractProgress(c) >= c.target) {
      const old = w.progression.completed;
      w.claimContract(c.id);
      assert.equal(w.progression.completed, old + 1);
      claims++;
      maxId = Math.max(maxId, c.id);
      continue;
    }
    if (c.metric === "parties" && w.coins > 400) w.hostEvent();
    if (c.metric === "built" && w.coins > 500 && w.facilities.length < 40)
      build(
        (["spring", "cafe", "lodge", "garden"] as FacilityKind[])[
          w.facilities.length % 4
        ],
      );
    if (c.metric === "upgraded" && w.coins > 600) {
      const f = w.facilities.find(
        (f) => f.level < w.maxLevel && w.upgradeCost(f) < w.coins - 300,
      );
      if (f) w.upgrade(f.id);
    }
  }
  // Business expands gradually as the guest limit grows.
  if (
    w.elapsed % 180 < 10 &&
    w.coins > 1200 &&
    w.facilities.length < Math.min(28, 6 + w.rank * 3)
  )
    build(
      (["lodge", "spring", "cafe"] as FacilityKind[])[w.facilities.length % 3],
    );
  if (w.elapsed % 90 < 10 && w.coins > 1500) {
    const f = [...w.facilities]
      .sort((a, b) => b.served - a.served)
      .find((f) => f.level < w.maxLevel && w.upgradeCost(f) < w.coins - 700);
    if (f) w.upgrade(f.id);
  }
}
for (let second = 0; second < 72000; second += 2) {
  w.step(2);
  if (second % 10 === 0) manage();
  if (chapterTimes[w.rank] === null)
    chapterTimes[w.rank] = Math.round(w.elapsed);
  if ((second + 2) % 3600 === 0) {
    const row = {
      hour: (second + 2) / 3600,
      chapter: w.rank + 1,
      xp: w.progression.xp,
      commissions: w.progression.completed,
      coins: Math.round(w.coins),
      guests: w.guests.length,
      served: w.metrics.services,
      facilities: w.facilities.length,
      research: w.progression.research.length,
      achievements: w.progression.achievements.length,
    };
    report.push(row);
    console.log(JSON.stringify(row));
    const snap = w.snapshot();
    const restored = new Resort(JSON.parse(JSON.stringify(snap)));
    assert.deepEqual(restored.snapshot(), snap);
    w = restored;
  }
  assert.ok(Number.isFinite(w.coins) && w.coins >= 0);
  assert.equal(w.progression.contracts.length, 3);
  assert.ok(w.guests.length <= 60);
}
assert.ok(claims > 100, "Too few ongoing tasks completed");
assert.ok(w.rank >= 5, "Late research chapters unreachable");
assert.ok(w.progression.research.length >= 6, "Research progression stalled");
assert.ok(w.metrics.services > 2000, "Guest services stalled");
writeFileSync(
  "docs/career-balance-report.json",
  JSON.stringify(
    {
      simulationHours: 20,
      policy:
        "Scripted active management every ten simulation seconds; 1x clock; not a human playtest",
      chapterTimesSeconds: chapterTimes,
      claims,
      maxTaskId: maxId,
      chapters: CHAPTERS.map((c) => c.name),
      hourly: report,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  "PASS: 20 simulated hours, continuing task generation, economy, hourly save/restore and late progression.",
);
