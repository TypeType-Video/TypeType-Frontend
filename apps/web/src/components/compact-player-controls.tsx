import { Volume2, VolumeX } from "lucide-react";
import { useInterfaceLocale } from "../hooks/use-interface-locale";
import { MuteButton, useMediaState } from "../lib/vidstack";
import { m } from "../paraglide/messages.js";
import { AudioPlayButton } from "./audio-play-button";
import { AudioSeekButton } from "./audio-seek-button";

export function CompactPlayerControls({
  video,
  seeking,
}: {
  video: HTMLVideoElement | null;
  seeking: boolean;
}) {
  const { locale } = useInterfaceLocale();
  const muted = useMediaState("muted");
  const volume = useMediaState("volume");
  const canSeek = useMediaState("canSeek");
  const silent = muted || volume === 0;
  const Icon = silent ? VolumeX : Volume2;
  const label = silent ? m.player_unmute({}, { locale }) : m.player_mute({}, { locale });
  return (
    <div className="typetype-compact-controls">
      <AudioSeekButton direction="backward" video={video} disabled={seeking || !canSeek} />
      <AudioPlayButton video={video} disabled={seeking} />
      <AudioSeekButton direction="forward" video={video} disabled={seeking || !canSeek} />
      <MuteButton aria-label={label} title={label} disabled={seeking}>
        <Icon size={20} aria-hidden="true" />
      </MuteButton>
    </div>
  );
}
