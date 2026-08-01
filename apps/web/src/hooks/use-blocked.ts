import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  blockChannel,
  blockKeyword,
  blockVideo,
  fetchBlockedChannels,
  fetchBlockedKeywords,
  fetchBlockedVideos,
  unblockChannel,
  unblockKeyword,
  unblockVideo,
} from "../lib/api-collections";
import { useAuth } from "./use-auth";

type BlockChannelArgs = {
  url: string;
  name?: string;
  thumbnailUrl?: string;
  global?: boolean;
};

type BlockVideoArgs = {
  url: string;
  global?: boolean;
};

export function useBlocked() {
  const qc = useQueryClient();
  const { authReady, isAuthed, me } = useAuth();
  const owner = isAuthed ? (me?.id ?? "authenticated") : "signed-out";
  const channelsKey = ["blocked-channels", owner] as const;
  const keywordsKey = ["blocked-keywords", owner] as const;
  const videosKey = ["blocked-videos", owner] as const;

  const channels = useQuery({
    queryKey: channelsKey,
    queryFn: fetchBlockedChannels,
    enabled: authReady && isAuthed,
    staleTime: 5 * 60 * 1000,
  });
  const videos = useQuery({
    queryKey: videosKey,
    queryFn: fetchBlockedVideos,
    enabled: authReady && isAuthed,
    staleTime: 5 * 60 * 1000,
  });
  const keywords = useQuery({
    queryKey: keywordsKey,
    queryFn: fetchBlockedKeywords,
    enabled: authReady && isAuthed,
    staleTime: 5 * 60 * 1000,
  });

  const addChannel = useMutation({
    mutationFn: ({ url, name, thumbnailUrl, global }: BlockChannelArgs) =>
      isAuthed ? blockChannel(url, name, thumbnailUrl, global) : Promise.resolve(),
    onSuccess: () => qc.invalidateQueries({ queryKey: channelsKey }),
  });

  const removeChannel = useMutation({
    mutationFn: (url: string) => (isAuthed ? unblockChannel(url) : Promise.resolve()),
    onSuccess: () => qc.invalidateQueries({ queryKey: channelsKey }),
  });

  const addVideo = useMutation({
    mutationFn: ({ url, global }: BlockVideoArgs) =>
      isAuthed ? blockVideo(url, global) : Promise.resolve(),
    onSuccess: () => qc.invalidateQueries({ queryKey: videosKey }),
  });

  const removeVideo = useMutation({
    mutationFn: (url: string) => (isAuthed ? unblockVideo(url) : Promise.resolve()),
    onSuccess: () => qc.invalidateQueries({ queryKey: videosKey }),
  });

  const addKeyword = useMutation({
    mutationFn: (keyword: string) =>
      isAuthed ? blockKeyword(keyword).then(() => undefined) : Promise.resolve(),
    onSuccess: () => qc.invalidateQueries({ queryKey: keywordsKey }),
  });

  const removeKeyword = useMutation({
    mutationFn: (keyword: string) => (isAuthed ? unblockKeyword(keyword) : Promise.resolve()),
    onSuccess: () => qc.invalidateQueries({ queryKey: keywordsKey }),
  });

  return {
    channels,
    videos,
    keywords,
    addChannel,
    removeChannel,
    addVideo,
    removeVideo,
    addKeyword,
    removeKeyword,
  };
}
