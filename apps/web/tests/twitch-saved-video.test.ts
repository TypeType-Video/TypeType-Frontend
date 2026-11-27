import { expect, test } from "bun:test";
import { twitchVideoIdFromUrl, twitchVideoStream } from "../src/lib/twitch-saved-video";
import { toPublicWatchParam } from "../src/lib/watch-url";

test("a saved Twitch VOD URL gives its video id", () => {
  expect(twitchVideoIdFromUrl("https://www.twitch.tv/videos/2370123456")).toBe("2370123456");
  expect(twitchVideoIdFromUrl(" https://m.twitch.tv/videos/42?t=1h ")).toBe("42");
  expect(twitchVideoIdFromUrl("https://www.twitch.tv/runner")).toBeNull();
  expect(twitchVideoIdFromUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBeNull();
});

test("a saved Twitch VOD keeps its full URL in watch links", () => {
  const url = "https://www.twitch.tv/videos/2370123456";
  expect(toPublicWatchParam(url)).toBe(url);
});

test("a Twitch VOD is saved under its URL with title, cover, length and channel", () => {
  const stream = twitchVideoStream({
    id: "2370123456",
    title: "Speedrun VOD",
    owner: { id: "1", login: "runner", displayName: "Runner", avatarUrl: "https://a/r.png" },
    lengthSeconds: 5400,
    views: 42,
    previewUrl: "https://p/v.jpg",
    createdAt: "2026-11-20T18:00:00Z",
    type: "archive",
  });
  expect(stream.id).toBe("https://www.twitch.tv/videos/2370123456");
  expect(stream.rawThumbnail).toBe("https://p/v.jpg");
  expect(stream.duration).toBe(5400);
  expect(stream.channelName).toBe("Runner");
  expect(stream.channelUrl).toBe("https://www.twitch.tv/runner");
  expect(stream.publishedAt).toBe(Date.parse("2026-11-20T18:00:00Z"));
});
