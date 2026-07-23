import { expect, test } from "bun:test";
import { defaultSabrAudioTrackId, sabrAudioOptions } from "../src/lib/sabr-audio";
import { resolveSabrPlaybackConfig } from "../src/lib/sabr-source";
import type { AudioStreamItem, VideoStreamItem } from "../src/types/api";
import type { VideoStream } from "../src/types/stream";

function audio(id: string, name: string, locale: string, original = false): AudioStreamItem {
  return {
    url: "",
    format: "m4a",
    quality: 128,
    bitrate: 128,
    codec: "mp4a.40.2",
    mimeType: "audio/mp4",
    audioTrackId: id,
    audioTrackName: name,
    audioLocale: locale,
    isOriginal: original,
    itag: 140,
    contentLength: 1,
    initStart: 0,
    initEnd: 1,
    indexStart: 2,
    indexEnd: 3,
    deliveryMethod: "sabr",
    sabrSessionUrl: `/sabr/session/video?audioTrackId=${encodeURIComponent(id)}`,
  };
}

const video = {
  itag: 137,
  codec: "avc1.640028",
  mimeType: "video/mp4",
  height: 1080,
  deliveryMethod: "sabr",
  sabrSessionUrl: "/sabr/session/video",
} as VideoStreamItem;

const stream = {
  id: "video",
  originalAudioTrackId: "en-US.4",
  preferredDefaultAudioTrackId: "en-US.4",
  videoOnlyStreams: [video],
  audioStreams: [
    audio("en-US.4", "English (US) original", "en", true),
    audio("fr-FR.1", "French (France)", "fr"),
  ],
} as VideoStream;

test("exposes backend audio names without generic duplicate labels", () => {
  expect(sabrAudioOptions(stream).map((option) => option.label)).toEqual([
    "English (US) original",
    "French (France)",
  ]);
});

test("matches the preferred language and switches the sabr track id", () => {
  expect(defaultSabrAudioTrackId(stream, "fr-FR")).toBe("fr-FR.1");
  const config = withManagedMediaSource(() => resolveSabrPlaybackConfig(stream, 137, "fr-FR.1"));
  expect(config?.audioTrackId).toBe("fr-FR.1");
  const audioOnly = withManagedMediaSource(() =>
    resolveSabrPlaybackConfig(stream, 137, "fr-FR.1", true),
  );
  expect(audioOnly?.audioOnly).toBe(true);
  expect(audioOnly?.key.endsWith(":audio")).toBe(true);
});

test("marks live playback sessions for the MSE engine", () => {
  const live = { ...stream, isLive: true } as VideoStream;
  const config = withManagedMediaSource(() => resolveSabrPlaybackConfig(live, 137, "en-US.4"));

  expect(config?.isLive).toBe(true);
  expect(config?.key).toContain(":live:");
});

function withManagedMediaSource<T>(work: () => T): T {
  const scope = globalThis as typeof globalThis & { ManagedMediaSource?: unknown };
  const original = Object.getOwnPropertyDescriptor(scope, "ManagedMediaSource");
  const FakeManagedMediaSource = Object.assign(function FakeManagedMediaSource() {}, {
    isTypeSupported: () => true,
  });
  Object.defineProperty(scope, "ManagedMediaSource", {
    configurable: true,
    value: FakeManagedMediaSource,
  });
  try {
    return work();
  } finally {
    if (original) Object.defineProperty(scope, "ManagedMediaSource", original);
    else delete scope.ManagedMediaSource;
  }
}
