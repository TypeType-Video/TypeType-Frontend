export type PlayerVolumeState = {
  volume: number;
  muted: boolean;
};

export function clampPlayerVolume(volume: number): number {
  if (!Number.isFinite(volume)) return 1;
  return Math.min(1, Math.max(0, volume));
}

export function matchesPlayerVolume(
  current: PlayerVolumeState,
  target: PlayerVolumeState,
): boolean {
  return Math.abs(current.volume - target.volume) < 0.001 && current.muted === target.muted;
}
