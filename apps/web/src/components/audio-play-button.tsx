import { useInterfaceLocale } from "../hooks/use-interface-locale";
import { useVideoPaused } from "../hooks/use-video-paused";
import { requestSabrVidstackPlayback } from "../lib/sabr-vidstack-bridge";
import { useMediaRemote, useMediaState } from "../lib/vidstack";
import { m } from "../paraglide/messages.js";
import { AudioPauseIcon, AudioPlayIcon } from "./audio-control-icons";

export function AudioPlayButton({
  video = null,
  disabled = false,
}: {
  video?: HTMLVideoElement | null;
  disabled?: boolean;
}) {
  const { locale } = useInterfaceLocale();
  const remote = useMediaRemote();
  const mediaPaused = useMediaState("paused");
  const paused = useVideoPaused(video, mediaPaused);
  const Icon = paused ? AudioPlayIcon : AudioPauseIcon;
  const label = paused ? m.player_play({}, { locale }) : m.player_pause({}, { locale });

  const togglePlayback = async () => {
    if (video) return requestSabrVidstackPlayback(video, video.paused, true);
    if (paused) await remote.play();
    else await remote.pause();
  };

  return (
    <button
      type="button"
      className="typetype-audio-play-button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClickCapture={(event) => {
        event.stopPropagation();
        void togglePlayback().catch(() => {});
      }}
    >
      <Icon size={32} />
    </button>
  );
}
