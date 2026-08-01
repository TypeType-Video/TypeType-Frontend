import { useCallback, useMemo } from "react";
import {
  type BlockableVideo,
  type BlockedChannelIdentity,
  createBlockedContentMatcher,
} from "../lib/blocked-content";
import type { ChannelResultItem } from "../types/api";
import type { PublicPlaylistInfo } from "../types/playlist";
import { useAuth } from "./use-auth";
import { useBlocked } from "./use-blocked";

export function useBlockedFilter() {
  const { isAuthed } = useAuth();
  const { channels, videos, keywords } = useBlocked();

  const matcher = useMemo(
    () =>
      createBlockedContentMatcher(
        isAuthed ? (channels.data ?? []) : [],
        isAuthed ? (videos.data ?? []) : [],
        isAuthed ? (keywords.data ?? []).map((item) => item.keyword) : [],
      ),
    [channels.data, isAuthed, keywords.data, videos.data],
  );

  const isBlocked = useCallback(
    (stream: BlockableVideo): boolean => matcher.isVideoBlocked(stream),
    [matcher],
  );

  const filter = useCallback(
    <T extends BlockableVideo>(streams: T[]): T[] => matcher.filterVideos(streams),
    [matcher],
  );

  const isChannelIdentityBlocked = useCallback(
    (channel: BlockedChannelIdentity): boolean => matcher.isChannelBlocked(channel),
    [matcher],
  );

  const findBlockedChannel = useCallback(
    (channel: BlockedChannelIdentity) => matcher.findBlockedChannel(channel),
    [matcher],
  );

  const isChannelBlocked = useCallback(
    (channel: ChannelResultItem): boolean => isChannelIdentityBlocked(channel),
    [isChannelIdentityBlocked],
  );

  const isVideoExplicitlyBlocked = useCallback(
    (video: Pick<BlockableVideo, "id" | "url">): boolean => matcher.isVideoExplicitlyBlocked(video),
    [matcher],
  );

  const findBlockedVideo = useCallback(
    (video: Pick<BlockableVideo, "id" | "url">) => matcher.findBlockedVideo(video),
    [matcher],
  );

  const isPlaylistBlocked = useCallback(
    (playlist: PublicPlaylistInfo): boolean => {
      return isChannelIdentityBlocked({ name: playlist.uploaderName });
    },
    [isChannelIdentityBlocked],
  );

  return {
    filter,
    findBlockedChannel,
    findBlockedVideo,
    isBlocked,
    isChannelBlocked,
    isChannelIdentityBlocked,
    isPlaylistBlocked,
    isVideoExplicitlyBlocked,
    blockedChannelUrls: matcher.channelUrls,
    blockedKeywords: matcher.normalizedKeywords,
    blockedVideoUrls: matcher.videoUrls,
  };
}
