import { expect, test } from "bun:test";
import { SettingsWriteQueue } from "../src/lib/settings-write-queue";
import type { SettingsItem } from "../src/types/user";

const base = { defaultService: 0, volume: 1, muted: false } as SettingsItem;
const fallback = () => base;

test("serializes full settings writes and applies later patches", async () => {
  const queue = new SettingsWriteQueue();
  const requests: SettingsItem[] = [];
  let releaseFirst!: () => void;
  const firstDone = new Promise<void>((resolve) => {
    releaseFirst = resolve;
  });
  const first = queue.stage({ volume: 0.4 }, base);
  const firstRun = queue.execute(
    first,
    async (settings) => {
      requests.push(settings);
      await firstDone;
      return settings;
    },
    fallback,
    () => undefined,
  );
  const second = queue.stage({ muted: true }, { ...base, volume: 0.4 });
  const secondRun = queue.execute(
    second,
    async (settings) => {
      requests.push(settings);
      return settings;
    },
    fallback,
    () => undefined,
  );

  await Bun.sleep(1);
  expect(requests).toEqual([{ ...base, volume: 0.4 }]);
  releaseFirst();
  await Promise.all([firstRun, secondRun]);
  expect(requests).toEqual([
    { ...base, volume: 0.4 },
    { ...base, volume: 0.4, muted: true },
  ]);
});

test("a failed write does not leak its patch into the next request", async () => {
  const queue = new SettingsWriteQueue();
  const requests: SettingsItem[] = [];
  const first = queue.stage({ volume: 0.2 }, base);
  const firstRun = queue.execute(
    first,
    async (settings) => {
      requests.push(settings);
      throw new Error("network");
    },
    fallback,
    () => undefined,
  );
  const second = queue.stage({ muted: true }, { ...base, volume: 0.2 });
  const secondRun = queue.execute(
    second,
    async (settings) => {
      requests.push(settings);
      return settings;
    },
    fallback,
    () => undefined,
  );

  await expect(firstRun).rejects.toThrow("network");
  await secondRun;
  expect(requests).toEqual([
    { ...base, volume: 0.2 },
    { ...base, muted: true },
  ]);
});

test("snapshot keeps pending patches after a completed write", async () => {
  const queue = new SettingsWriteQueue();
  const first = queue.stage({ defaultService: 1 }, base);
  const second = queue.stage({ muted: true }, { ...base, defaultService: 1 });
  const firstRun = queue.execute(
    first,
    async (settings) => ({ ...settings }),
    fallback,
    () => undefined,
  );
  queue.execute(
    second,
    async (settings) => ({ ...settings }),
    fallback,
    () => undefined,
  );
  await firstRun;
  expect(queue.snapshot(fallback)).toMatchObject({ defaultService: 1, muted: true });
});
