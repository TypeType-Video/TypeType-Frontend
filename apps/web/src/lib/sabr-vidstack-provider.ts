import { requestSabrSeek, requestSabrVidstackPlayback } from "./sabr-vidstack-bridge";
import type { VideoProvider } from "./vidstack";

export function bindSabrVideoProvider(provider: VideoProvider): VideoProvider {
  provider.loadSource = async () => undefined;
  provider.play = () => requestSabrVidstackPlayback(provider.video, true);
  provider.pause = () => requestSabrVidstackPlayback(provider.video, false);
  provider.setCurrentTime = (time) => {
    requestSabrSeek(provider.video, time);
  };
  return provider;
}
