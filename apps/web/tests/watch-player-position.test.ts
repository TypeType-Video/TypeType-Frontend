import { expect, test } from "bun:test";
import { resolveWatchPlayerStartTime } from "../src/lib/watch-player-position";

test("keeps the current position when switching the player layout", () => {
  expect(resolveWatchPlayerStartTime(120_000, 48_500, true)).toBe(48_500);
});

test("keeps an explicit seek back to the beginning", () => {
  expect(resolveWatchPlayerStartTime(120_000, 0, true)).toBe(0);
});

test("uses the configured position when no layout switch is happening", () => {
  expect(resolveWatchPlayerStartTime(120_000, 48_500, false)).toBe(120_000);
});

test("rejects invalid positions without losing the configured position", () => {
  expect(resolveWatchPlayerStartTime(120_000, Number.NaN, true)).toBe(120_000);
});
