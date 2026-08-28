import type { VideoStream } from "../types/stream";
import { toPublicWatchParam } from "./watch-url";

export function mergeWatchRecommendations(
  currentId: string,
  primary: VideoStream[],
  fallback: VideoStream[],
): VideoStream[] {
  const current = toPublicWatchParam(currentId);
  const seen = new Set<string>();
  const result: VideoStream[] = [];

  for (const stream of [...primary, ...fallback]) {
    const id = toPublicWatchParam(stream.id);
    if (!id || id === current || seen.has(id)) continue;
    seen.add(id);
    result.push(stream);
  }
  return result;
}
