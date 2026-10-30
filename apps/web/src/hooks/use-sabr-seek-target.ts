import { useEffect, useRef, useState } from "react";
import { subscribeSabrSeekTarget } from "../lib/sabr-vidstack-bridge";

const REACHED_SECONDS = 1;

export function useSabrSeekTarget(video: HTMLVideoElement | null, seeking: boolean): number | null {
  const [target, setTarget] = useState<number | null>(null);
  const wasSeeking = useRef(seeking);
  useEffect(() => (video ? subscribeSabrSeekTarget(video, setTarget) : undefined), [video]);
  useEffect(() => {
    if (!video || target === null) return;
    const clearWhenReached = () => {
      if (Math.abs(video.currentTime - target) < REACHED_SECONDS) setTarget(null);
    };
    for (const event of ["timeupdate", "playing"]) video.addEventListener(event, clearWhenReached);
    return () => {
      for (const event of ["timeupdate", "playing"])
        video.removeEventListener(event, clearWhenReached);
    };
  }, [video, target]);
  useEffect(() => {
    if (wasSeeking.current && !seeking) setTarget(null);
    wasSeeking.current = seeking;
  }, [seeking]);
  return target;
}
