export function resolveEmbedAutoplay(
  retryKey: number,
  playbackIntent: boolean,
  requestedAutoplay: boolean,
): boolean {
  return retryKey === 0 ? requestedAutoplay : playbackIntent;
}
