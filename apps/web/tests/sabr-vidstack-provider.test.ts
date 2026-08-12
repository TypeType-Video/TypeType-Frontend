import { expect, test } from "bun:test";
import { registerSabrVidstackControls } from "../src/lib/sabr-vidstack-bridge";
import { bindSabrVideoProvider } from "../src/lib/sabr-vidstack-provider";

function setupProvider(currentTime = 0, paused = true, ended = false) {
  const positions: number[] = [];
  const events = new EventTarget();
  const video = {
    addEventListener: events.addEventListener.bind(events),
    autoplay: false,
    currentTime,
    dispatchEvent: events.dispatchEvent.bind(events),
    ended,
    paused,
    pause: () => {},
  } as unknown as HTMLVideoElement;
  const provider = { video } as Parameters<typeof bindSabrVideoProvider>[0];
  const unregister = registerSabrVidstackControls(video, {
    play: async () => {},
    pause: () => {},
    seek: (seconds) => positions.push(seconds),
  });
  bindSabrVideoProvider(provider);
  return { positions, provider, unregister };
}

test("routes Vidstack provider seeks through SABR controls", () => {
  const { positions, provider, unregister } = setupProvider();

  try {
    provider.setCurrentTime(93.5);

    expect(positions).toEqual([93.5]);
  } finally {
    unregister();
  }
});

test("ignores Vidstack's initial playback reset after a saved-position resume", () => {
  const { positions, provider, unregister } = setupProvider(486.792, false);

  try {
    void provider.play();
    provider.setCurrentTime(0);
    provider.setCurrentTime(47.897);

    expect(positions).toEqual([47.897]);
  } finally {
    unregister();
  }
});

test("keeps the initial reset guard through resume positioning", async () => {
  const { positions, provider, unregister } = setupProvider(11.2, true);

  try {
    provider.setCurrentTime(11.2);
    provider.video.currentTime = 15.064;
    provider.setCurrentTime(15.064);
    await provider.play();
    provider.setCurrentTime(0);

    expect(positions).toEqual([11.2, 15.064]);
  } finally {
    unregister();
  }
});

test("keeps the initial reset guard after a technical pause", async () => {
  const { positions, provider, unregister } = setupProvider(15.064, true);

  try {
    await provider.play();
    await provider.pause();
    provider.setCurrentTime(0);

    expect(positions).toEqual([]);
  } finally {
    unregister();
  }
});

test("keeps the initial reset guard when Vidstack reloads its provider", async () => {
  const { positions, provider, unregister } = setupProvider(15.064, true);

  try {
    await provider.play();
    provider.video.currentTime = 0;
    const replacement = bindSabrVideoProvider({ video: provider.video } as typeof provider);
    replacement.setCurrentTime(0);

    expect(positions).toEqual([]);
  } finally {
    unregister();
  }
});

test("ignores a queued reset after resume positioning but before play", () => {
  const { positions, provider, unregister } = setupProvider(15.064, true);

  try {
    provider.video.dispatchEvent(new Event("seeked"));
    provider.setCurrentTime(0);

    expect(positions).toEqual([]);
  } finally {
    unregister();
  }
});

test("ignores the initial reset while native Safari playback still reports paused", () => {
  const { positions, provider, unregister } = setupProvider(486.792, true);

  try {
    void provider.play();
    provider.setCurrentTime(0);

    expect(positions).toEqual([]);
  } finally {
    unregister();
  }
});

test("allows a real seek to zero after the initial reset is consumed", () => {
  const { positions, provider, unregister } = setupProvider(486.792, false);

  try {
    void provider.play();
    provider.setCurrentTime(0);
    provider.setCurrentTime(0);

    expect(positions).toEqual([0]);
  } finally {
    unregister();
  }
});

test("allows a paused seek to zero before playback starts", () => {
  const { positions, provider, unregister } = setupProvider(486.792, true);

  try {
    provider.setCurrentTime(0);

    expect(positions).toEqual([0]);
  } finally {
    unregister();
  }
});
