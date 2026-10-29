import { expect, test } from "bun:test";
import type * as dashjs from "dashjs";
import { buildDashStreamingSettings } from "../src/components/video-player-core";
import { attachBilibiliSeekBuffer } from "../src/lib/dash-bilibili-seek-buffer";

test("uses modest Bilibili forward targets and keeps the backward cache", () => {
  expect(buildDashStreamingSettings("bilibili").buffer).toEqual({
    bufferTimeDefault: 4,
    bufferTimeAtTopQuality: 6,
    bufferTimeAtTopQualityLongForm: 8,
    bufferToKeep: 20,
  });
  expect(buildDashStreamingSettings("youtube").buffer).toEqual({
    bufferTimeDefault: 24,
    bufferTimeAtTopQuality: 36,
    bufferTimeAtTopQualityLongForm: 60,
    bufferToKeep: 20,
  });
});

test("keeps the Bilibili seek target short until playback advances without flushing cache", () => {
  const listeners = new Map<string, (event: unknown) => void>();
  const updates: unknown[] = [];
  let paused = true;
  let seeking = true;
  const player = {
    on: (type: string, listener: (event: unknown) => void) => listeners.set(type, listener),
    updateSettings: (settings: unknown) => updates.push(settings),
    isPaused: () => paused,
    isSeeking: () => seeking,
  } as unknown as dashjs.MediaPlayerClass;
  attachBilibiliSeekBuffer(player);

  listeners.get("playbackSeeking")?.({ seekTime: 30 });
  expect(updates).toEqual([
    {
      streaming: {
        buffer: {
          bufferTimeDefault: 2,
          bufferTimeAtTopQuality: 2,
          bufferTimeAtTopQualityLongForm: 2,
        },
      },
    },
  ]);
  expect(JSON.stringify(updates)).not.toContain("bufferToKeep");

  listeners.get("playbackTimeUpdated")?.({ time: 31.6 });
  expect(updates).toHaveLength(1);

  paused = false;
  seeking = false;
  listeners.get("playbackTimeUpdated")?.({ time: 31.4 });
  expect(updates).toHaveLength(1);
  listeners.get("playbackTimeUpdated")?.({ time: 31.5 });
  expect(updates[1]).toEqual({
    streaming: {
      buffer: {
        bufferTimeDefault: 4,
        bufferTimeAtTopQuality: 6,
        bufferTimeAtTopQualityLongForm: 8,
      },
    },
  });
});
