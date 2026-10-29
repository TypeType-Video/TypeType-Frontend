import { useEffect, useRef } from "react";
import { buildChaptersVtt, buildSponsorBlockChaptersVtt } from "../lib/chapters-vtt";
import { proxyUrl } from "../lib/proxy";
import { buildThumbnailVtt } from "../lib/thumbnail-vtt";
import type { SponsorBlockSegmentItem } from "../types/api";
import type { VideoStream } from "../types/stream";

function previewFramesKey(stream: VideoStream): string {
  return (stream.previewFrames ?? [])
    .map(
      (frame) =>
        `${frame.frameWidth}:${frame.frameHeight}:${frame.durationPerFrame}:${frame.urls.join(",")}`,
    )
    .join("|");
}

function streamSegmentsKey(stream: VideoStream): string {
  return (stream.streamSegments ?? [])
    .map((segment) => `${segment.startTimeSeconds}:${segment.title}`)
    .join("|");
}

function sponsorBlockSegmentsKey(segments: SponsorBlockSegmentItem[] | undefined): string {
  return (segments ?? [])
    .map(
      (segment) => `${segment.startTime}:${segment.endTime}:${segment.category}:${segment.action}`,
    )
    .join("|");
}

function useKeyedObjectUrl(key: string, build: () => string | null): string | null {
  const asset = useRef<{ key: string; url: string | null } | null>(null);
  if (asset.current?.key !== key) asset.current = { key, url: build() };
  const url = asset.current.url;
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );
  return url;
}

export function useWatchVttAssets(
  stream: VideoStream,
  sponsorBlockSegments: SponsorBlockSegmentItem[] | undefined,
  showSponsorBlockChapters: boolean,
) {
  const thumbnailKey = `${stream.duration}:${previewFramesKey(stream)}`;
  const chaptersKey = `${showSponsorBlockChapters}:${stream.duration}:${streamSegmentsKey(stream)}:${sponsorBlockSegmentsKey(sponsorBlockSegments)}`;
  const thumbnailVtt = useKeyedObjectUrl(thumbnailKey, () =>
    stream.previewFrames
      ? buildThumbnailVtt(
          stream.previewFrames.map((frame) => ({ ...frame, urls: frame.urls.map(proxyUrl) })),
          stream.duration,
        )
      : null,
  );
  const chaptersVtt = useKeyedObjectUrl(chaptersKey, () =>
    stream.streamSegments
      ? buildChaptersVtt(stream.streamSegments, stream.duration)
      : showSponsorBlockChapters
        ? buildSponsorBlockChaptersVtt(sponsorBlockSegments ?? [], stream.duration)
        : null,
  );

  return {
    thumbnailVtt: thumbnailVtt ?? undefined,
    chaptersVtt: chaptersVtt ?? undefined,
  };
}
