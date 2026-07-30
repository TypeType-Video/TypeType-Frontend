import { expect, test } from "bun:test";
import { shouldRunSponsorBlockAutoSkip } from "../src/lib/sponsorblock-playback-tools";
import type { SponsorBlockSegmentItem } from "../src/types/api";

const segment: SponsorBlockSegmentItem = {
  startTime: 10_000,
  endTime: 20_000,
  category: "sponsor",
  action: "skip",
};

test("keeps automatic SponsorBlock skipping enabled in audio-only mode", () => {
  expect(
    shouldRunSponsorBlockAutoSkip({
      audioOnly: true,
      autoSkip: true,
      autoSkipSegments: [segment],
    }),
  ).toBeTrue();
});

test("keeps automatic SponsorBlock skipping enabled in video mode", () => {
  expect(
    shouldRunSponsorBlockAutoSkip({
      audioOnly: false,
      autoSkip: true,
      autoSkipSegments: [segment],
    }),
  ).toBeTrue();
});

test("does not run automatic SponsorBlock skipping without eligible segments", () => {
  expect(
    shouldRunSponsorBlockAutoSkip({
      audioOnly: true,
      autoSkip: true,
    }),
  ).toBeFalse();
});
