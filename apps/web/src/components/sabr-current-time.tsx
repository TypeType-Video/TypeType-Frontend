import { useRef } from "react";
import { formatDuration } from "../lib/format";
import { useMediaState } from "../lib/vidstack";

export function stableSabrCurrentTime(
  currentTime: number,
  transitioning: boolean,
  previousTime: number,
): number {
  if (transitioning) return previousTime;
  return Number.isFinite(currentTime) && currentTime >= 0 ? currentTime : previousTime;
}

export function SabrCurrentTime({
  transitioning,
  video,
}: {
  transitioning: boolean;
  video: HTMLVideoElement | null;
}) {
  const mediaStateTime = useMediaState("currentTime");
  const currentTime =
    video && Number.isFinite(video.currentTime) ? video.currentTime : mediaStateTime;
  const stableTimeRef = useRef(Number.isFinite(currentTime) ? currentTime : 0);
  const stableTime = stableSabrCurrentTime(currentTime, transitioning, stableTimeRef.current);
  stableTimeRef.current = stableTime;
  return (
    <span className="vds-time" data-type="current">
      {formatDuration(Math.floor(stableTime))}
    </span>
  );
}
