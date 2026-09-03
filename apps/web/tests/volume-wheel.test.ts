import { expect, test } from "bun:test";
import { volumeAfterWheel } from "../src/lib/volume-wheel";

test("raises volume when scrolling up", () => {
  expect(volumeAfterWheel(0.4, -100)).toBeCloseTo(0.45);
});

test("lowers volume when scrolling down", () => {
  expect(volumeAfterWheel(0.4, 100)).toBeCloseTo(0.35);
});

test("keeps volume within the media range", () => {
  expect(volumeAfterWheel(0, 100)).toBe(0);
  expect(volumeAfterWheel(1, -100)).toBe(1);
});

test("ignores invalid wheel deltas", () => {
  expect(volumeAfterWheel(0.4, 0)).toBe(0.4);
  expect(volumeAfterWheel(0.4, Number.NaN)).toBe(0.4);
});
