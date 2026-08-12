import type { BlockableVideo } from "./blocked-content";

export function isMembersOnlyContentHidden(
  video: BlockableVideo,
  hideMembersOnlyContent: boolean,
): boolean {
  return hideMembersOnlyContent && video.requiresMembership === true;
}

export function filterMembersOnlyContent<T extends BlockableVideo>(
  videos: T[],
  hideMembersOnlyContent: boolean,
): T[] {
  return videos.filter((video) => !isMembersOnlyContentHidden(video, hideMembersOnlyContent));
}
