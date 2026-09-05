import { expect, test } from "bun:test";
import { resolveSabrStartTimeMs, SabrVideoHandoff } from "../src/lib/sabr-video-handoff";

test("hands off the last position when the same video receives a new element", () => {
  const previousVideo = {};

  expect(
    resolveSabrStartTimeMs(
      { video: previousVideo, videoId: "video-1", positionMs: 13_267 },
      {},
      "video-1",
      0,
    ),
  ).toBe(13_267);
});

test("uses the configured position for a new video", () => {
  expect(
    resolveSabrStartTimeMs(
      { video: {}, videoId: "video-1", positionMs: 13_267 },
      {},
      "video-2",
      4_500.4,
    ),
  ).toBe(4_500);
});

test("normalizes invalid configured and handoff positions", () => {
  expect(
    resolveSabrStartTimeMs(
      { video: {}, videoId: "video-1", positionMs: Number.NaN },
      {},
      "video-1",
      Number.NaN,
    ),
  ).toBe(0);
});

test("captures the old element position before a provider replacement", () => {
  const handoff = new SabrVideoHandoff();
  const oldVideo = {};
  const newVideo = {};

  handoff.attach(oldVideo, "video-1", 0);
  handoff.capture(oldVideo, "video-1", 8_900);
  handoff.capture(oldVideo, "video-1", 2_300);

  expect(handoff.attach(newVideo, "video-1", 0)).toEqual({
    startTimeMs: 2_300,
    replacingVideo: true,
  });
});
