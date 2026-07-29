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

const CHANNELS_KEY = ["blocked-channels"];
const KEYWORDS_KEY = ["blocked-keywords"];
const VIDEOS_KEY = ["blocked-videos"];

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
  const { authReady, isAuthed } = useAuth();

  const channels = useQuery({
    queryKey: CHANNELS_KEY,
    queryFn: fetchBlockedChannels,
    enabled: authReady && isAuthed,
    staleTime: 5 * 60 * 1000,
  });
  const videos = useQuery({
    queryKey: VIDEOS_KEY,
    queryFn: fetchBlockedVideos,
    enabled: authReady && isAuthed,
    staleTime: 5 * 60 * 1000,
  });
  const keywords = useQuery({
    queryKey: KEYWORDS_KEY,
    queryFn: fetchBlockedKeywords,
    enabled: authReady && isAuthed,
    staleTime: 5 * 60 * 1000,
  });

  const addChannel = useMutation({
    mutationFn: ({ url, name, thumbnailUrl, global }: BlockChannelArgs) =>
      isAuthed ? blockChannel(url, name, thumbnailUrl, global) : Promise.resolve(),
    onSuccess: () => qc.invalidateQueries({ queryKey: CHANNELS_KEY }),
  });

  const removeChannel = useMutation({
    mutationFn: (url: string) => (isAuthed ? unblockChannel(url) : Promise.resolve()),
    onSuccess: () => qc.invalidateQueries({ queryKey: CHANNELS_KEY }),
  });

  const addVideo = useMutation({
    mutationFn: ({ url, global }: BlockVideoArgs) =>
      isAuthed ? blockVideo(url, global) : Promise.resolve(),
    onSuccess: () => qc.invalidateQueries({ queryKey: VIDEOS_KEY }),
  });

  const removeVideo = useMutation({
    mutationFn: (url: string) => (isAuthed ? unblockVideo(url) : Promise.resolve()),
    onSuccess: () => qc.invalidateQueries({ queryKey: VIDEOS_KEY }),
  });

  const addKeyword = useMutation({
    mutationFn: (keyword: string) =>
      isAuthed ? blockKeyword(keyword).then(() => undefined) : Promise.resolve(),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYWORDS_KEY }),
  });

  const removeKeyword = useMutation({
    mutationFn: (keyword: string) => (isAuthed ? unblockKeyword(keyword) : Promise.resolve()),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYWORDS_KEY }),
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
