import { useInterfaceLocale } from "../hooks/use-interface-locale";
import { defaultLayoutIcons, MuteButton, useMediaState, VolumeSlider } from "../lib/vidstack";
import { m } from "../paraglide/messages.js";

export function PlayerVolumeControl() {
  const { locale } = useInterfaceLocale();
  const muted = useMediaState("muted");
  const volume = useMediaState("volume");
  const canSetVolume = useMediaState("canSetVolume");
  const Icon =
    muted || volume === 0
      ? defaultLayoutIcons.MuteButton.Mute
      : volume < 0.5
        ? defaultLayoutIcons.MuteButton.VolumeLow
        : defaultLayoutIcons.MuteButton.VolumeHigh;

  return (
    <div className="typetype-mobile-volume-control">
      <MuteButton
        className="typetype-mobile-volume-mute"
        aria-label={muted ? m.player_unmute({}, { locale }) : m.player_mute({}, { locale })}
      >
        <Icon />
      </MuteButton>
      {canSetVolume ? (
        <VolumeSlider.Root className="typetype-mobile-volume-slider">
          <VolumeSlider.Track className="typetype-mobile-volume-track">
            <VolumeSlider.TrackFill className="typetype-mobile-volume-fill" />
          </VolumeSlider.Track>
          <VolumeSlider.Thumb className="typetype-mobile-volume-thumb" />
        </VolumeSlider.Root>
      ) : null}
    </div>
  );
}
