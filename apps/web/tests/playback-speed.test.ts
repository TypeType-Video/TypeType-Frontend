import { describe, expect, test } from "bun:test";
import { normalizeDefaultPlaybackSpeed, playbackSpeedLabel } from "../src/lib/playback-speed";

describe("default playback speed", () => {
  test("clamps persisted values to the supported range", () => {
    expect(normalizeDefaultPlaybackSpeed(0)).toBe(0.25);
    expect(normalizeDefaultPlaybackSpeed(12)).toBe(4);
    expect(normalizeDefaultPlaybackSpeed(Number.NaN)).toBe(1);
  });

  test("formats the settings label", () => {
    expect(playbackSpeedLabel(1.5)).toBe("1.5x");
  });
});
