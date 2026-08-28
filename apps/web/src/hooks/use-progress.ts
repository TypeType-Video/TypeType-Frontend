import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchProgress, updateProgress } from "../lib/api-collections";
import {
  type HistoryPageData,
  type HistoryPagesData,
  updateHistoryPageProgress,
  updateHistoryPagesProgress,
} from "../lib/history-progress-cache";
import { useAuthStore } from "../stores/auth-store";
import type { ProgressItem } from "../types/user";
import { useAuth } from "./use-auth";

export function useProgress(videoUrl: string) {
  const { authReady, isAuthed } = useAuth();
  return useQuery({
    queryKey: ["progress", videoUrl],
    queryFn: () =>
      isAuthed ? fetchProgress(videoUrl) : Promise.resolve({ videoUrl, position: 0, updatedAt: 0 }),
    retry: false,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    enabled: authReady && videoUrl.length > 0,
  });
}

export function useSaveProgress(videoUrl: string) {
  const { authReady, isAuthed } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ position, keepalive }: { position: number; keepalive: boolean }) => {
      const token = useAuthStore.getState().token;
      return token ? updateProgress(videoUrl, position, keepalive) : Promise.resolve();
    },
    onSuccess: (_, { position }) => {
      if (!authReady || !isAuthed || !useAuthStore.getState().token) return;
      const next: ProgressItem = {
        videoUrl,
        position: Math.round(position),
        updatedAt: Date.now(),
      };
      qc.setQueryData(["progress", videoUrl], next);
      qc.setQueriesData<HistoryPagesData>({ queryKey: ["history"] }, (data) =>
        updateHistoryPagesProgress(data, videoUrl, position),
      );
      qc.setQueriesData<HistoryPageData>({ queryKey: ["history-filtered"] }, (data) =>
        updateHistoryPageProgress(data, videoUrl, position),
      );
    },
  });
}
