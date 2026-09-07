import { expect, test } from "bun:test";
import { isPlayerOutsideViewport } from "../src/lib/compact-player-position";

test("waits for the entire video to pass behind the header", () => {
  expect(isPlayerOutsideViewport(300, false)).toBe(false);
  expect(isPlayerOutsideViewport(57, false)).toBe(false);
  expect(isPlayerOutsideViewport(56, false)).toBe(true);
});

test("keeps compact mode through small scroll reversals", () => {
  expect(isPlayerOutsideViewport(57, true)).toBe(true);
  expect(isPlayerOutsideViewport(112, true)).toBe(true);
  expect(isPlayerOutsideViewport(113, true)).toBe(false);
});
