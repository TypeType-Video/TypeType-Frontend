import { expect, test } from "bun:test";
import { registerSabrVidstackControls } from "../src/lib/sabr-vidstack-bridge";
import { bindSabrVideoProvider } from "../src/lib/sabr-vidstack-provider";

test("routes Vidstack provider seeks through SABR controls", () => {
  const positions: number[] = [];
  const video = { autoplay: false, pause: () => {} } as HTMLVideoElement;
  const provider = { video } as Parameters<typeof bindSabrVideoProvider>[0];
  const unregister = registerSabrVidstackControls(video, {
    play: async () => {},
    pause: () => {},
    seek: (seconds) => positions.push(seconds),
  });

  try {
    bindSabrVideoProvider(provider).setCurrentTime(93.5);

    expect(positions).toEqual([93.5]);
  } finally {
    unregister();
  }
});
