import { useEffect, useRef } from "react";
import {
  clampPlayerVolume,
  matchesPlayerVolume,
  type PlayerVolumeState,
} from "../lib/player-volume-state";
import { useMediaPlayer, useMediaRemote, useMediaState } from "../lib/vidstack";

type Props = {
  initialVolume: number;
  initialMuted: boolean;
  settingsReady: boolean;
  onVolumeChange?: (volume: number, muted: boolean) => void;
};

export function VolumeRestorer({
  initialVolume,
  initialMuted,
  settingsReady,
  onVolumeChange,
}: Props) {
  const remote = useMediaRemote();
  const player = useMediaPlayer();
  const volume = useMediaState("volume");
  const muted = useMediaState("muted");
  const canPlay = useMediaState("canPlay");
  const pendingTargetRef = useRef<PlayerVolumeState | null>(null);
  const restoredTargetRef = useRef<PlayerVolumeState | null>(null);

  useEffect(() => {
    if (!settingsReady) {
      pendingTargetRef.current = null;
      restoredTargetRef.current = null;
      return;
    }
    const target = { volume: clampPlayerVolume(initialVolume), muted: initialMuted };
    if (restoredTargetRef.current && matchesPlayerVolume(restoredTargetRef.current, target)) {
      return;
    }
    if (!canPlay) return;
    const root = player?.el;
    if (!root?.isConnected) return;
    pendingTargetRef.current = target;
    restoredTargetRef.current = null;
    try {
      if (target.muted) {
        remote.changeVolume(target.volume);
        remote.mute();
      } else {
        remote.unmute();
        remote.changeVolume(target.volume);
      }
    } catch {
      pendingTargetRef.current = null;
    }
  }, [settingsReady, canPlay, remote, initialVolume, initialMuted, player]);

  useEffect(() => {
    const target = pendingTargetRef.current;
    if (!target || !matchesPlayerVolume({ volume, muted }, target)) return;
    pendingTargetRef.current = null;
    restoredTargetRef.current = target;
  }, [volume, muted]);

  useEffect(() => {
    if (pendingTargetRef.current) return;
    if (!restoredTargetRef.current) return;
    onVolumeChange?.(volume, muted);
  }, [volume, muted, onVolumeChange]);

  return null;
}
