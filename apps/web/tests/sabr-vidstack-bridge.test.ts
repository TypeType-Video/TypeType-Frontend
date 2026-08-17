import { expect, test } from "bun:test";
import {
  isSabrPlaybackEventTransient,
  registerSabrVidstackControls,
  requestSabrSeek,
  requestSabrVidstackPlayback,
} from "../src/lib/sabr-vidstack-bridge";
import { seekSponsorBlockSegment } from "../src/lib/sponsorblock-seek";

test("replays a pending SABR play request when MSE controls register", async () => {
  let plays = 0;
  const video = { autoplay: false, pause: () => {} } as HTMLVideoElement;

  await requestSabrVidstackPlayback(video, true);
  registerSabrVidstackControls(video, {
    play: async () => {
      plays += 1;
    },
    pause: () => {},
    seek: () => {},
  });
  await Promise.resolve();

  expect(video.autoplay).toBe(true);
  expect(plays).toBe(1);
});

test("keeps only the latest pending SABR playback intent", async () => {
  let pauses = 0;
  const video = { autoplay: false, pause: () => {} } as HTMLVideoElement;

  await requestSabrVidstackPlayback(video, true);
  await requestSabrVidstackPlayback(video, false);
  registerSabrVidstackControls(video, {
    play: async () => {},
    pause: () => {
      pauses += 1;
    },
    seek: () => {},
  });

  expect(video.autoplay).toBe(false);
  expect(pauses).toBe(1);
});

test("ignores technical pauses during SABR transitions", async () => {
  let pauses = 0;
  const video = { autoplay: true, pause: () => {} } as HTMLVideoElement;

  registerSabrVidstackControls(video, {
    play: async () => {},
    pause: () => {
      pauses += 1;
    },
    seek: () => {},
    isTransitioning: () => true,
  });
  await requestSabrVidstackPlayback(video, false);

  expect(video.autoplay).toBe(true);
  expect(pauses).toBe(0);
});

test("ignores technical pauses while Safari has hidden the page", async () => {
  let pauses = 0;
  const video = { autoplay: true, pause: () => {} } as HTMLVideoElement;
  const previousDocument = globalThis.document;
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: { visibilityState: "hidden" },
  });

  try {
    registerSabrVidstackControls(video, {
      play: async () => {},
      pause: () => {
        pauses += 1;
      },
      seek: () => {},
    });
    await requestSabrVidstackPlayback(video, false);

    expect(video.autoplay).toBe(true);
    expect(pauses).toBe(0);
  } finally {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: previousDocument,
    });
  }
});

test("applies explicit pauses while Safari has hidden the page", async () => {
  let pauses = 0;
  const video = { autoplay: true, pause: () => {} } as HTMLVideoElement;
  const previousDocument = globalThis.document;
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: { visibilityState: "hidden" },
  });

  try {
    registerSabrVidstackControls(video, {
      play: async () => {},
      pause: () => {
        pauses += 1;
      },
      seek: () => {},
    });
    await requestSabrVidstackPlayback(video, false, true);

    expect(video.autoplay).toBe(false);
    expect(pauses).toBe(1);
  } finally {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: previousDocument,
    });
  }
});

test("applies user pauses during SABR transitions", async () => {
  let pauses = 0;
  const video = { autoplay: true, pause: () => {} } as HTMLVideoElement;

  registerSabrVidstackControls(video, {
    play: async () => {},
    pause: () => {
      pauses += 1;
    },
    seek: () => {},
    isTransitioning: () => true,
  });
  await requestSabrVidstackPlayback(video, false, true);

  expect(video.autoplay).toBe(false);
  expect(pauses).toBe(1);
});

test("sends only explicit SABR seek requests to registered MSE controls", () => {
  const positions: number[] = [];
  const video = { autoplay: false, pause: () => {} } as HTMLVideoElement;

  expect(requestSabrSeek(video, 12)).toBe(false);
  registerSabrVidstackControls(video, {
    play: async () => {},
    pause: () => {},
    seek: (seconds) => positions.push(seconds),
  });

  expect(requestSabrSeek(video, 95)).toBe(true);
  expect(positions).toEqual([95]);
});

test("identifies only player-owned transient media events", () => {
  let transient = true;
  const video = { autoplay: false, pause: () => {} } as HTMLVideoElement;
  const unregister = registerSabrVidstackControls(video, {
    play: async () => {},
    pause: () => {},
    seek: () => {},
    isApplyingTransientMediaState: () => transient,
  });

  expect(isSabrPlaybackEventTransient(video)).toBe(true);
  transient = false;
  expect(isSabrPlaybackEventTransient(video)).toBe(false);

  unregister();
  expect(isSabrPlaybackEventTransient(video)).toBe(false);
});

test("routes SponsorBlock seeks through registered SABR controls", () => {
  const positions: number[] = [];
  const fallbacks: number[] = [];
  const video = { autoplay: false, pause: () => {} } as HTMLVideoElement;
  registerSabrVidstackControls(video, {
    play: async () => {},
    pause: () => {},
    seek: (seconds) => positions.push(seconds),
  });

  seekSponsorBlockSegment(video, (seconds) => fallbacks.push(seconds), 154.7);

  expect(positions).toEqual([154.7]);
  expect(fallbacks).toEqual([]);
});
