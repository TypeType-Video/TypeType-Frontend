import { lazy, Suspense } from "react";
import type { VideoStream } from "../types/stream";

const VideoPreview = lazy(() =>
  import("./video-preview").then((module) => ({ default: module.VideoPreview })),
);

type Props = {
  stream: VideoStream | undefined;
  show: boolean;
};

export function VideoPreviewSlot({ stream, show }: Props) {
  if (!show || !stream) return null;
  return (
    <Suspense fallback={null}>
      <VideoPreview stream={stream} show={show} />
    </Suspense>
  );
}
