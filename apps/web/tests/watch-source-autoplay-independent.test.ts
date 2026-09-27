import { expect, test } from "bun:test";
import { decideWatchSourceAutoplay } from "../src/hooks/use-watch-player-source-state";

test("autoplay next can stay disabled while open autoplay is enabled", () => {
  expect(
    decideWatchSourceAutoplay({
      previous: null,
      streamId: "video-id",
      retryKey: 0,
      settingsReady: true,
      autoplayEnabled: false,
      autoplayOnOpen: true,
      playbackIntent: null,
      autoplayIntent: false,
    }),
  ).toBe(true);
});
