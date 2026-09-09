import { expect, test } from "bun:test";
import { clampPlayerVolume, matchesPlayerVolume } from "../src/lib/player-volume-state";

test("clamps invalid and out-of-range volume values", () => {
  expect(clampPlayerVolume(-1)).toBe(0);
  expect(clampPlayerVolume(2)).toBe(1);
  expect(clampPlayerVolume(Number.NaN)).toBe(1);
});

test("matches volume state with media precision tolerance", () => {
  expect(matchesPlayerVolume({ volume: 0.4004, muted: false }, { volume: 0.4, muted: false })).toBe(
    true,
  );
  expect(matchesPlayerVolume({ volume: 0.41, muted: false }, { volume: 0.4, muted: false })).toBe(
    false,
  );
  expect(matchesPlayerVolume({ volume: 0.4, muted: true }, { volume: 0.4, muted: false })).toBe(
    false,
  );
});
