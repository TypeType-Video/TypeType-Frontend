import type { WheelEvent } from "react";
import { useRef } from "react";
import { useInterfaceLocale } from "../hooks/use-interface-locale";
import {
  defaultLayoutIcons,
  MuteButton,
  useMediaRemote,
  useMediaState,
  VolumeSlider,
} from "../lib/vidstack";
import { volumeAfterWheel } from "../lib/volume-wheel";
import { m } from "../paraglide/messages.js";

function useVolumeWheel() {
  const remote = useMediaRemote();
  const volume = useMediaState("volume");
  const canSetVolume = useMediaState("canSetVolume");
  const volumeRef = useRef(volume);
  volumeRef.current = volume;

  return (event: WheelEvent<HTMLElement>) => {
    if (!canSetVolume || !Number.isFinite(event.deltaY) || event.deltaY === 0) return;

    const nextVolume = volumeAfterWheel(volumeRef.current, event.deltaY);
    if (nextVolume === volumeRef.current) return;

    event.preventDefault();
    volumeRef.current = nextVolume;
    remote.changeVolume(nextVolume, event.nativeEvent);
  };
}

export function PlayerVolumeSlider() {
  const { locale } = useInterfaceLocale();
  const canSetVolume = useMediaState("canSetVolume");
  const handleWheel = useVolumeWheel();

  if (!canSetVolume) return null;

  return (
    <div className="contents" onWheelCapture={handleWheel}>
      <VolumeSlider.Root
        className="vds-volume-slider vds-slider"
        aria-label={m.player_volume({}, { locale })}
      >
        <VolumeSlider.Track className="vds-slider-track" />
        <VolumeSlider.TrackFill className="vds-slider-track-fill vds-slider-track" />
        <VolumeSlider.Thumb className="vds-slider-thumb" />
        <VolumeSlider.Preview className="vds-slider-preview" noClamp>
          <VolumeSlider.Value className="vds-slider-value" />
        </VolumeSlider.Preview>
      </VolumeSlider.Root>
    </div>
  );
}

export function PlayerVolumeControl() {
  const { locale } = useInterfaceLocale();
  const muted = useMediaState("muted");
  const volume = useMediaState("volume");
  const canSetVolume = useMediaState("canSetVolume");
  const handleWheel = useVolumeWheel();
  const Icon =
    muted || volume === 0
      ? defaultLayoutIcons.MuteButton.Mute
      : volume < 0.5
        ? defaultLayoutIcons.MuteButton.VolumeLow
        : defaultLayoutIcons.MuteButton.VolumeHigh;

  return (
    <div className="typetype-mobile-volume-control" onWheelCapture={handleWheel}>
      <MuteButton
        className="typetype-mobile-volume-mute"
        aria-label={muted ? m.player_unmute({}, { locale }) : m.player_mute({}, { locale })}
      >
        <Icon />
      </MuteButton>
      {canSetVolume ? (
        <VolumeSlider.Root
          className="typetype-mobile-volume-slider"
          aria-label={m.player_volume({}, { locale })}
        >
          <VolumeSlider.Track className="typetype-mobile-volume-track">
            <VolumeSlider.TrackFill className="typetype-mobile-volume-fill" />
          </VolumeSlider.Track>
          <VolumeSlider.Thumb className="typetype-mobile-volume-thumb" />
        </VolumeSlider.Root>
      ) : null}
    </div>
  );
}
