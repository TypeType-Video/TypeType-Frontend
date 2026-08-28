import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchHomeRecommendations } from "../lib/api-recommendations";
import { mapVideoItem } from "../lib/mappers";
import { mergeWatchRecommendations } from "../lib/watch-recommendations";
import { watchServiceId } from "../lib/watch-url";
import type { VideoStream } from "../types/stream";
import { useAuth } from "./use-auth";

const FALLBACK_LIMIT = 18;
const EMPTY_RECOMMENDATIONS: VideoStream[] = [];

export function useWatchRecommendations(
  stream: VideoStream,
  service: number,
  hidden: boolean,
): VideoStream[] {
  const { authReady, isAuthed } = useAuth();
  const primary = hidden ? EMPTY_RECOMMENDATIONS : (stream.related ?? EMPTY_RECOMMENDATIONS);
  const recommendationService = watchServiceId(stream.id, service);
  const query = useQuery({
    queryKey: ["watch-recommendations", recommendationService],
    queryFn: () =>
      fetchHomeRecommendations(recommendationService, FALLBACK_LIMIT, undefined, "quick"),
    enabled: authReady && isAuthed && !hidden && primary.length === 0,
    staleTime: 90 * 1000,
  });

  return useMemo(() => {
    if (hidden) return EMPTY_RECOMMENDATIONS;
    const fallback = (query.data?.items ?? []).map(mapVideoItem);
    return mergeWatchRecommendations(stream.id, primary, fallback);
  }, [hidden, primary, query.data?.items, stream.id]);
}
