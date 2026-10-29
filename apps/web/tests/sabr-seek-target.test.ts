import { expect, test } from "bun:test";
import {
  percentFromMediaSeconds,
  secondsFromMediaSliderPercent,
} from "../src/lib/sabr-player-seek";
import {
  registerSabrVidstackControls,
  requestSabrSeek,
  subscribeSabrSeekTarget,
} from "../src/lib/sabr-vidstack-bridge";

function media(duration: number, start = 0, end = duration) {
  return {
    duration,
    seekable: { length: 1, start: () => start, end: () => end } as unknown as TimeRanges,
  };
}

test("a replay target puts the slider back at the start", () => {
  expect(percentFromMediaSeconds(media(600), 0)).toBe(0);
});

test("slider percent and seconds are inverse of each other", () => {
  const video = media(600, 0, 600);
  const seconds = secondsFromMediaSliderPercent(video, 25);
  expect(seconds).toBe(150);
  expect(percentFromMediaSeconds(video, seconds ?? 0)).toBe(25);
});

test("an unknown duration gives no slider position", () => {
  expect(
    percentFromMediaSeconds({ duration: Number.NaN, seekable: { length: 0 } as TimeRanges }, 10),
  ).toBeNull();
});

test("the player UI hears every seek target, including a replay from the end", () => {
  const video = { autoplay: false, pause: () => {} } as HTMLVideoElement;
  registerSabrVidstackControls(video, { play: async () => {}, pause: () => {}, seek: () => {} });
  const heard: number[] = [];
  const unsubscribe = subscribeSabrSeekTarget(video, (seconds) => heard.push(seconds));
  requestSabrSeek(video, 0);
  requestSabrSeek(video, 42);
  unsubscribe();
  requestSabrSeek(video, 7);
  expect(heard).toEqual([0, 42]);
});
