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

test("does not persist restored settings or a change reverted before saving", async () => {
  const updates: unknown[] = [];
  const sync = createDebouncedVolumeSync(
    (patch) => updates.push(patch),
    5,
    () => ({
      volume: 0.6,
      muted: false,
    }),
  );
  sync.schedule(0.6, false);
  await Bun.sleep(15);
  sync.schedule(0.2, true);
  sync.schedule(0.6, false);
  await Bun.sleep(15);
  expect(updates).toEqual([]);
});

test("checks the latest settings again before sending", async () => {
  const updates: unknown[] = [];
  let current = { volume: 0.6, muted: false };
  const sync = createDebouncedVolumeSync(
    (patch) => updates.push(patch),
    5,
    () => current,
  );
  sync.schedule(0.2, true);
  current = { volume: 0.2, muted: true };
  await Bun.sleep(15);
  expect(updates).toEqual([]);
});

test("repeated identical events do not postpone persistence indefinitely", async () => {
  const updates: unknown[] = [];
  let current = { volume: 1, muted: false };
  const sync = createDebouncedVolumeSync(
    (patch) => {
      updates.push(patch);
      current = { ...current, ...patch };
    },
    5,
    () => current,
  );
  for (let i = 0; i < 20; i++) {
    sync.schedule(0.3, true);
    await Bun.sleep(1);
  }
  expect(updates).toEqual([{ volume: 0.3, muted: true }]);
  sync.cancel();
});

test("an unsaved value can be retried and mute-only changes are saved", async () => {
  const updates: unknown[] = [];
  const sync = createDebouncedVolumeSync(
    (patch) => updates.push(patch),
    5,
    () => ({
      volume: 0.6,
      muted: false,
    }),
  );
  sync.schedule(0.6, true);
  await Bun.sleep(15);
  sync.schedule(0.6, true);
  await Bun.sleep(15);
  expect(updates).toEqual([
    { volume: 0.6, muted: true },
    { volume: 0.6, muted: true },
  ]);
});
