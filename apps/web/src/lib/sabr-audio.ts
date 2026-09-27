import { isMseTypeSupported } from "@typetype/mse";
import type { SabrAudioOption } from "../stores/sabr-audio-store";
import type { AudioStreamItem } from "../types/api";
import type { VideoStream } from "../types/stream";

function normalizeLanguage(value: string | null | undefined): string {
  return value?.trim().toLowerCase().replace(/_/g, "-") ?? "";
}

function audioCandidates(stream: VideoStream): AudioStreamItem[] {
  return (stream.audioStreams ?? []).filter(
    (item) =>
      item.deliveryMethod === "sabr" &&
      Boolean(item.sabrSessionUrl?.trim()) &&
      Boolean(item.codec?.trim()) &&
      Boolean(item.mimeType?.trim()),
  );
}

function isMseAudioSupported(item: AudioStreamItem): boolean {
  if (!item.mimeType || !item.codec) return false;
  return isMseTypeSupported(`${item.mimeType}; codecs="${item.codec}"`);
}

export function sabrAudioOptions(stream: VideoStream): SabrAudioOption[] {
  const seen = new Set<string>();
  return audioCandidates(stream).flatMap((item) => {
    const id = item.audioTrackId?.trim();
    if (!id || seen.has(id)) return [];
    seen.add(id);
    return [
      {
        id,
        label: item.audioTrackName?.trim() || item.audioLocale?.trim() || id,
        language: item.audioLocale?.trim() || id.split(".")[0] || "und",
        original: item.isOriginal,
      },
    ];
  });
}

export function defaultSabrAudioTrackId(
  stream: VideoStream,
  preferredLanguage?: string,
  preferOriginalLanguage = false,
): string | null {
  const candidates = audioCandidates(stream);
  const originalMatch = candidates.find(
    (item) => item.audioTrackId === stream.originalAudioTrackId || item.isOriginal,
  );
  if (preferOriginalLanguage && originalMatch?.audioTrackId) return originalMatch.audioTrackId;
  const preferred = normalizeLanguage(preferredLanguage);
  const languageMatch = preferred
    ? candidates.find((item) => {
        const locale = normalizeLanguage(item.audioLocale);
        return locale === preferred || locale.split("-")[0] === preferred.split("-")[0];
      })
    : null;
  const preferredTrackId = stream.preferredDefaultAudioTrackId ?? stream.originalAudioTrackId;
  return (
    languageMatch?.audioTrackId ??
    candidates.find((item) => item.audioTrackId === preferredTrackId)?.audioTrackId ??
    candidates[0]?.audioTrackId ??
    null
  );
}

export function pickSabrAudio(
  stream: VideoStream,
  selectedTrackId?: string | null,
): AudioStreamItem | null {
  const candidates = audioCandidates(stream);
  const supported = candidates.filter(isMseAudioSupported);
  const playable = supported.length > 0 ? supported : candidates;
  const fallbackId = defaultSabrAudioTrackId(stream);
  return (
    playable.find((item) => item.audioTrackId === selectedTrackId) ??
    playable.find((item) => item.audioTrackId === fallbackId) ??
    playable[0] ??
    null
  );
}
