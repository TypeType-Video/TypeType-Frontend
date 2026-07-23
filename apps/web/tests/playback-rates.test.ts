import { expect, test } from "bun:test";
import { PLAYBACK_RATES } from "../src/lib/playback-rates";

test("offers playback speeds up to 4x", () => {
  expect(PLAYBACK_RATES).toEqual({
    min: 0,
    max: 4,
    step: 0.25,
  });
});
