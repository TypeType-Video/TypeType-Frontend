import type * as dashjs from "dashjs";

const SEEK_BUFFER_SECONDS = 2;
const RESTORE_AFTER_SECONDS = 1.5;
const STEADY_BUFFER = {
  bufferTimeDefault: 4,
  bufferTimeAtTopQuality: 6,
  bufferTimeAtTopQualityLongForm: 8,
} as const;

function updateForwardBuffer(player: dashjs.MediaPlayerClass, seconds: number): void {
  player.updateSettings({
    streaming: {
      buffer: {
        bufferTimeDefault: seconds,
        bufferTimeAtTopQuality: seconds,
        bufferTimeAtTopQualityLongForm: seconds,
      },
    },
  });
}

export function attachBilibiliSeekBuffer(player: dashjs.MediaPlayerClass): void {
  let pendingSeekTime: number | null = null;
  player.on("playbackSeeking", (event: dashjs.PlaybackSeekingEvent) => {
    if (event.seekTime === null || !Number.isFinite(event.seekTime)) return;
    pendingSeekTime = event.seekTime;
    updateForwardBuffer(player, SEEK_BUFFER_SECONDS);
  });
  player.on("playbackTimeUpdated", (event: dashjs.PlaybackTimeUpdatedEvent) => {
    if (
      pendingSeekTime === null ||
      event.time === null ||
      !Number.isFinite(event.time) ||
      player.isPaused() ||
      player.isSeeking() ||
      event.time < pendingSeekTime + RESTORE_AFTER_SECONDS
    )
      return;
    pendingSeekTime = null;
    player.updateSettings({ streaming: { buffer: STEADY_BUFFER } });
  });
}
