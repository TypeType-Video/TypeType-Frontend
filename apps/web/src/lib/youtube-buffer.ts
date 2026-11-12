export const YOUTUBE_BUFFER_SECONDS = [10, 30, 60, 120] as const;

export type YoutubeBufferSeconds = (typeof YOUTUBE_BUFFER_SECONDS)[number];

export const DEFAULT_YOUTUBE_BUFFER_SECONDS: YoutubeBufferSeconds = 30;

export function isYoutubeBufferSeconds(value: unknown): value is YoutubeBufferSeconds {
  return YOUTUBE_BUFFER_SECONDS.some((seconds) => seconds === value);
}

export function youtubeBufferConfig(
  seconds: YoutubeBufferSeconds,
  isLive = false,
): { bufferGoalMs?: number } {
  return isLive ? {} : { bufferGoalMs: seconds * 1000 };
}
