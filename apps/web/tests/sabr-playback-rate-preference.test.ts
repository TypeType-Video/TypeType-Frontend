import { describe, expect, test } from "bun:test";
import { SabrPlaybackRatePreference } from "../src/lib/sabr-playback-rate-preference";

function video(rate = 1): HTMLVideoElement {
  return {
    defaultPlaybackRate: rate,
    playbackRate: rate,
  } as HTMLVideoElement;
}

describe("SabrPlaybackRatePreference", () => {
  test("restores the user rate after a media element replacement", () => {
    const preference = new SabrPlaybackRatePreference();
    const first = video();
    preference.initialize(first);
    first.playbackRate = 4;
    preference.capture(first, false);

    const replacement = video();
    preference.initialize(replacement);
    preference.apply(replacement, false);

    expect(replacement.defaultPlaybackRate).toBe(4);
    expect(replacement.playbackRate).toBe(4);
  });

  test("ignores transient preroll and provider rate changes", () => {
    const preference = new SabrPlaybackRatePreference();
    const first = video(4);
    preference.initialize(first);
    const replacement = video(16);
    preference.capture(replacement, true);
    replacement.playbackRate = 1;
    preference.capture(replacement, true);

    preference.apply(replacement, false);

    expect(replacement.defaultPlaybackRate).toBe(4);
    expect(replacement.playbackRate).toBe(4);
  });

  test("does not write while the MSE transition is active", () => {
    const preference = new SabrPlaybackRatePreference();
    const element = video(2);
    preference.initialize(element);
    element.playbackRate = 1;

    preference.apply(element, true);

    expect(element.defaultPlaybackRate).toBe(2);
    expect(element.playbackRate).toBe(1);
  });
});
