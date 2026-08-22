import { requestSabrSeek, requestSabrVidstackPlayback } from "./sabr-vidstack-bridge";
import type { VideoProvider } from "./vidstack";

type InitialPositionState = {
  protected: boolean;
  resumePosition: number;
  tracking: boolean;
};

const initialPositionByVideo = new WeakMap<HTMLVideoElement, InitialPositionState>();

export function bindSabrVideoProvider(provider: VideoProvider): VideoProvider {
  const initialPosition = initialPositionByVideo.get(provider.video) ?? {
    protected: true,
    resumePosition: 0,
    tracking: false,
  };
  initialPositionByVideo.set(provider.video, initialPosition);
  if (!initialPosition.tracking) {
    initialPosition.tracking = true;
    const rememberPosition = () => {
      if (provider.video.currentTime > 0)
        initialPosition.resumePosition = provider.video.currentTime;
    };
    for (const event of ["playing", "seeked", "seeking", "timeupdate"]) {
      provider.video.addEventListener(event, rememberPosition);
    }
  }
  provider.loadSource = async () => undefined;
  provider.play = () => {
    initialPosition.resumePosition = provider.video.currentTime;
    return requestSabrVidstackPlayback(provider.video, true);
  };
  provider.pause = () => requestSabrVidstackPlayback(provider.video, false);
  provider.setCurrentTime = (time) => {
    const isInitialPlaybackReset =
      initialPosition.protected &&
      time === 0 &&
      initialPosition.resumePosition > 0 &&
      !provider.video.ended;
    if (time === 0) initialPosition.protected = false;
    if (isInitialPlaybackReset) return;
    requestSabrSeek(provider.video, time);
  };
  return provider;
}
