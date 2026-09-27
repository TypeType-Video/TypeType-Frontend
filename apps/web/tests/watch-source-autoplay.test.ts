import { expect, test } from "bun:test";
import { decideWatchSourceAutoplay } from "../src/hooks/use-watch-player-source-state";

const previous = {
  playerKey: "video",
  streamId: "video-id",
  settingsReady: true,
  autoplay: true,
};

test("uses autoplay-on-open only for the initial source", () => {
  expect(
    decideWatchSourceAutoplay({
      previous: null,
      streamId: "video-id",
      retryKey: 0,
      settingsReady: true,
      autoplayEnabled: true,
      autoplayOnOpen: true,
      playbackIntent: null,
      autoplayIntent: false,
    }),
  ).toBe(true);
});

test("carries open autoplay through source bootstrap", () => {
  expect(
    decideWatchSourceAutoplay({
      previous,
      streamId: "video-id",
      retryKey: 0,
      settingsReady: true,
      autoplayEnabled: true,
      autoplayOnOpen: true,
      playbackIntent: null,
      autoplayIntent: false,
    }),
  ).toBe(true);
});

test("preserves pause across a source switch", () => {
  expect(
    decideWatchSourceAutoplay({
      previous,
      streamId: "video-id",
      retryKey: 0,
      settingsReady: true,
      autoplayEnabled: true,
      autoplayOnOpen: true,
      playbackIntent: false,
      autoplayIntent: false,
    }),
  ).toBe(false);
});

test("preserves playback across a source switch", () => {
  expect(
    decideWatchSourceAutoplay({
      previous,
      streamId: "video-id",
      retryKey: 0,
      settingsReady: true,
      autoplayEnabled: false,
      autoplayOnOpen: false,
      playbackIntent: true,
      autoplayIntent: false,
    }),
  ).toBe(true);
});
