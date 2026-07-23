import { expect, test } from "bun:test";
import { createDebouncedVolumeSync } from "../src/hooks/use-volume-sync";

test("coalesces volume changes to the latest values", async () => {
  const updates: unknown[] = [];
  const sync = createDebouncedVolumeSync((patch) => updates.push(patch), 5);

  sync.schedule(0.8, false);
  sync.schedule(0.2, true);
  await Bun.sleep(15);

  expect(updates).toEqual([{ volume: 0.2, muted: true }]);
});

test("cancels pending persistence during player teardown", async () => {
  const updates: unknown[] = [];
  const sync = createDebouncedVolumeSync((patch) => updates.push(patch), 5);

  sync.schedule(1, true);
  sync.cancel();
  await Bun.sleep(15);

  expect(updates).toEqual([]);
});
