import { requestSabrSeek, requestSabrVidstackPlayback } from "./sabr-vidstack-bridge";
import type { VideoProvider } from "./vidstack";

export function bindSabrVideoProvider(provider: VideoProvider): VideoProvider {
  let protectInitialPosition = true;
  provider.loadSource = async () => undefined;
  provider.play = () => requestSabrVidstackPlayback(provider.video, true);
  provider.pause = () => requestSabrVidstackPlayback(provider.video, false);
  provider.setCurrentTime = (time) => {
    const isInitialPlaybackReset =
      protectInitialPosition &&
      provider.video.autoplay &&
      time === 0 &&
      provider.video.currentTime > 0 &&
      !provider.video.ended;
    protectInitialPosition = false;
    if (isInitialPlaybackReset) return;
    requestSabrSeek(provider.video, time);
  };
  return provider;
}
