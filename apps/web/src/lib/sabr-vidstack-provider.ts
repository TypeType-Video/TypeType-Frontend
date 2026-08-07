import { requestSabrSeek, requestSabrVidstackPlayback } from "./sabr-vidstack-bridge";
import type { VideoProvider } from "./vidstack";

export function bindSabrVideoProvider(provider: VideoProvider): VideoProvider {
  let protectInitialPosition = true;
  provider.video.addEventListener(
    "playing",
    () => {
      protectInitialPosition = false;
    },
    { once: true },
  );
  provider.loadSource = async () => undefined;
  provider.play = () => requestSabrVidstackPlayback(provider.video, true);
  provider.pause = () => requestSabrVidstackPlayback(provider.video, false);
  provider.setCurrentTime = (time) => {
    const isInitialPlaybackReset =
      protectInitialPosition &&
      time === 0 &&
      provider.video.currentTime > 0 &&
      !provider.video.paused &&
      !provider.video.ended;
    protectInitialPosition = false;
    if (isInitialPlaybackReset) return;
    requestSabrSeek(provider.video, time);
  };
  return provider;
}
