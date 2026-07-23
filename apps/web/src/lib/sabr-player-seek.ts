import type { TypeTypeMsePlayer } from "@typetype/mse";
import { isAbortError } from "./sabr-playback-retry";

type SeekFlag = { current: boolean };

const seekRevisions = new WeakMap<SeekFlag, number>();

export function positionMs(video: HTMLVideoElement): number {
  return Math.max(0, Math.round(video.currentTime * 1000));
}

export function secondsFromSliderPercent(duration: number, percent: number): number | null {
  if (!Number.isFinite(duration) || duration <= 0 || !Number.isFinite(percent)) return null;
  return Math.max(0, Math.min(duration, (percent / 100) * duration));
}

export function secondsFromMediaSliderPercent(
  media: Pick<HTMLMediaElement, "duration" | "seekable">,
  percent: number,
): number | null {
  if (!Number.isFinite(percent)) return null;
  const ranges = media.seekable;
  if (ranges.length > 0) {
    const start = ranges.start(0);
    const end = ranges.end(ranges.length - 1);
    if (Number.isFinite(start) && Number.isFinite(end) && end > start) {
      return start + (Math.max(0, Math.min(100, percent)) / 100) * (end - start);
    }
  }
  return secondsFromSliderPercent(media.duration, percent);
}

export function runSabrSeek(
  player: TypeTypeMsePlayer | null,
  position: number,
  flag: SeekFlag,
  onError: (error: unknown) => void,
  onSeekingChange?: (seeking: boolean) => void,
) {
  if (!player) return;
  const revision = (seekRevisions.get(flag) ?? 0) + 1;
  seekRevisions.set(flag, revision);
  if (!flag.current) {
    flag.current = true;
    onSeekingChange?.(true);
  }
  void player
    .seek(position)
    .catch((error: unknown) => {
      if (seekRevisions.get(flag) === revision && !isAbortError(error)) onError(error);
    })
    .finally(() => {
      if (seekRevisions.get(flag) !== revision) return;
      flag.current = false;
      onSeekingChange?.(false);
    });
}

export function cancelPendingSabrSeek(flag: SeekFlag): void {
  seekRevisions.set(flag, (seekRevisions.get(flag) ?? 0) + 1);
}
