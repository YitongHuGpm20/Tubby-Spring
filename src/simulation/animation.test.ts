import test from "node:test";
import assert from "node:assert/strict";
import { animationFrame } from "../game/animation";
import manifest from "../game/spriteManifest.json";
test("exported animation timing selects held poses and loops without using spare grid cells", () => {
  const clip = {
    count: 3,
    durations: [100, 200, 400],
    cell: 256,
    keptBackground: [],
  };
  assert.equal(animationFrame(clip, 0), 0);
  assert.equal(animationFrame(clip, 0.15), 1);
  assert.equal(animationFrame(clip, 0.4), 2);
  assert.equal(animationFrame(clip, 0.71), 0);
});
test("every shipped animation has complete timing and enough playable frames", () => {
  for (const info of Object.values(manifest)) {
    assert.equal(info.durations.length, info.count);
    assert.ok(info.count >= 7);
    assert.ok(info.durations.every((n) => n > 0));
    for (let i = 0; i < 100; i++)
      assert.ok(animationFrame(info, i * 0.11) < info.count);
  }
});
