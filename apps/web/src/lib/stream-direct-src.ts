import type { VideoStream } from "../types/stream";
import { buildDashManifest } from "./dash-manifest";
import { API_BASE as BASE } from "./env";
import { pickCompactAudioTracks } from "./stream-audio-compact";
import { pickCompatibleProgressiveSrc } from "./stream-compatibility";
import { directAudioStreams, directVideoOnlyStreams } from "./stream-delivery";
import type { MediaSrc } from "./vidstack";

export function resolveDirectSrc(
  stream: VideoStream,
  maxHeight: number | undefined,
  compactAudioTracks: boolean,
  preferredAudioLanguage: string | undefined,
  maxCompactAudioTracks: number,
  allowServerManifests: boolean,
): MediaSrc {
  const directVideos = directVideoOnlyStreams(stream);
  const directAudios = directAudioStreams(stream);
  const audioStreams = compactAudioTracks
    ? pickCompactAudioTracks(directAudios, preferredAudioLanguage, maxCompactAudioTracks)
    : directAudios;

  if (directVideos.length && audioStreams.length) {
    const built = buildDashManifest(directVideos, audioStreams, stream.duration, maxHeight);
    if (built) return { src: built, type: "application/dash+xml" };
  }
  if (!allowServerManifests) {
    const progressiveSrc = pickCompatibleProgressiveSrc(stream);
    if (progressiveSrc) return progressiveSrc;
  }
  return {
    src: allowServerManifests
      ? `${BASE}/streams/manifest?url=${encodeURIComponent(stream.id)}`
      : "",
    type: "application/dash+xml",
  };
}
