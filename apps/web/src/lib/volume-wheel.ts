const VOLUME_SCROLL_REFERENCE = 100;
const VOLUME_SCROLL_STEP = 0.05;

function clampVolume(volume: number): number {
  return Math.min(1, Math.max(0, volume));
}

export function volumeAfterWheel(volume: number, deltaY: number): number {
  const currentVolume = clampVolume(Number.isFinite(volume) ? volume : 0);
  if (!Number.isFinite(deltaY) || deltaY === 0) return currentVolume;

  const change = Math.min(
    VOLUME_SCROLL_STEP,
    (Math.abs(deltaY) / VOLUME_SCROLL_REFERENCE) * VOLUME_SCROLL_STEP,
  );
  return clampVolume(currentVolume + (deltaY < 0 ? change : -change));
}
