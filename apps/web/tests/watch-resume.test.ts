import { expect, test } from "bun:test";
import { resolveWatchStartTime } from "../src/lib/watch-resume";

test("waits for authenticated progress before choosing the initial position", () => {
  expect(
    resolveWatchStartTime({
      authenticated: true,
      progressPending: true,
      durationSeconds: 600,
    }),
  ).toBeNull();
});

test("uses saved progress once it is available", () => {
  expect(
    resolveWatchStartTime({
      authenticated: true,
      progressPending: false,
      savedPositionMs: 125_000,
      serverPositionSeconds: 40,
      durationSeconds: 600,
    }),
  ).toBe(125_000);
});

test("does not delay guests and rejects positions too close to the end", () => {
  expect(
    resolveWatchStartTime({
      authenticated: false,
      progressPending: true,
      serverPositionSeconds: 40,
      durationSeconds: 600,
    }),
  ).toBe(40_000);
  expect(
    resolveWatchStartTime({
      authenticated: true,
      progressPending: false,
      savedPositionMs: 580_000,
      durationSeconds: 600,
    }),
  ).toBe(0);
});
