import { expect, test } from "bun:test";
import { stableSabrCurrentTime } from "../src/components/sabr-current-time";

test("holds the last stable time throughout a SABR transition", () => {
  let stableTime = stableSabrCurrentTime(42.375, false, 0);

  stableTime = stableSabrCurrentTime(0, true, stableTime);
  expect(stableTime).toBe(42.375);

  stableTime = stableSabrCurrentTime(39, true, stableTime);
  expect(stableTime).toBe(42.375);

  stableTime = stableSabrCurrentTime(42.41, false, stableTime);
  expect(stableTime).toBe(42.41);
});

test("ignores invalid media times", () => {
  expect(stableSabrCurrentTime(Number.NaN, false, 12)).toBe(12);
  expect(stableSabrCurrentTime(-1, false, 12)).toBe(12);
});
