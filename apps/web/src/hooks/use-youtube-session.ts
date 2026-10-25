import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelYoutubeDeviceLogin,
  disconnectYoutubeSession,
  fetchYoutubeSessionStatus,
  startYoutubeDeviceLogin,
} from "../lib/api-youtube-session";
import { useAuth } from "./use-auth";

const YOUTUBE_SESSION_KEY = ["youtube-session"];

export function useYoutubeSession() {
  const qc = useQueryClient();
  const { authReady, isAuthed } = useAuth();

  const status = useQuery({
    queryKey: YOUTUBE_SESSION_KEY,
    queryFn: fetchYoutubeSessionStatus,
    enabled: authReady && isAuthed,
    staleTime: 60_000,
  });

  const startDevice = useMutation({
    mutationFn: startYoutubeDeviceLogin,
  });

  const cancelDevice = useMutation({
    mutationFn: cancelYoutubeDeviceLogin,
  });

  const disconnect = useMutation({
    mutationFn: disconnectYoutubeSession,
    onSuccess: () => qc.invalidateQueries({ queryKey: YOUTUBE_SESSION_KEY }),
  });

  return { status, startDevice, cancelDevice, disconnect };
}
