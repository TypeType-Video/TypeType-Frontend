import { expect, test } from "bun:test";
import { mapYoutubeRemotePointer } from "../src/lib/youtube-remote-pointer";

const surface = { left: 100, top: 50, width: 800, height: 600 };

test("maps an object-contain click to the CSS viewport", () => {
  expect(
    mapYoutubeRemotePointer(
      500,
      350,
      surface,
      { width: 2560, height: 1440 },
      {
        width: 1280,
        height: 720,
      },
    ),
  ).toEqual({ x: 640, y: 360 });
});

test("clamps clicks in letterboxed space to the remote viewport", () => {
  expect(
    mapYoutubeRemotePointer(
      100,
      50,
      surface,
      { width: 1280, height: 720 },
      {
        width: 1280,
        height: 720,
      },
    ),
  ).toEqual({ x: 0, y: 0 });
  expect(
    mapYoutubeRemotePointer(
      900,
      650,
      surface,
      { width: 1280, height: 720 },
      {
        width: 1280,
        height: 720,
      },
    ),
  ).toEqual({ x: 1279, y: 719 });
});
