import { expect, test } from "bun:test";
import { mergeWatchRecommendations } from "../src/lib/watch-recommendations";
import type { VideoStream } from "../src/types/stream";

test("keeps extractor recommendations before fallback items", () => {
  expect(
    mergeWatchRecommendations(
      "https://www.youtube.com/watch?v=current",
      [stream("primary")],
      [stream("fallback")],
    ).map((item) => item.title),
  ).toEqual(["primary", "fallback"]);
});

test("removes the current video and duplicate fallback items", () => {
  expect(
    mergeWatchRecommendations(
      "https://www.youtube.com/watch?v=current",
      [stream("same")],
      [stream("current"), stream("same"), stream("new")],
    ).map((item) => item.title),
  ).toEqual(["same", "new"]);
});

function stream(id: string): VideoStream {
  return {
    id: `https://www.youtube.com/watch?v=${id}`,
    title: id,
    thumbnail: "",
    rawThumbnail: "",
    rawChannelAvatar: "",
    channelName: "channel",
    channelAvatar: "",
    views: 0,
    duration: 60,
  };
}
