import { useRef } from "react";
import { usePlayerError } from "../hooks/use-player-error";
import { usePlayerErrorResume } from "../hooks/use-player-error-resume";
import { useSabrPlaybackConfig } from "../hooks/use-sabr-playback-config";
import { useSettings } from "../hooks/use-settings";
import { useVolumeSync } from "../hooks/use-volume-sync";
import { useWatchVttAssets } from "../hooks/use-watch-layout-assets";
import { useWatchSponsorBlock } from "../hooks/use-watch-sponsorblock";
import { getOriginalAudioLocale } from "../lib/audio-track";
import { toPublicWatchParam } from "../lib/watch-url";
import type { VideoStream } from "../types/stream";
import { EmbedError, PLAYBACK_FAILED_MESSAGE } from "./embed-error";
import { EmbedVideoPlayer } from "./embed-player";

type Props = {
  stream: VideoStream;
  sourceUrl: string;
  startTime: number;
  autoplay: boolean;
  isAuthed: boolean;
};

export function EmbedPlayerShell({ stream, sourceUrl, startTime, autoplay, isAuthed }: Props) {
  const { settings, settingsReady, update } = useSettings();
  const isLive = stream.streamType === "live_stream" || stream.streamType === "audio_live_stream";
  const player = usePlayerError(stream, isLive);
  const handleVolumeChange = useVolumeSync(update.mutate);

  const positionRef = useRef(0);
  const playbackIntentRef = useRef<boolean | null>(null);
  const prevStreamId = useRef(stream.id);
  if (prevStreamId.current !== stream.id) {
    prevStreamId.current = stream.id;
    playbackIntentRef.current = null;
  }

  const { retryStartTime, handlePlayerError } = usePlayerErrorResume(
    stream.id,
    stream.duration,
    positionRef,
    player.handleError,
  );

  const effectiveStartTime = retryStartTime > 0 ? retryStartTime : startTime;
  const effectiveAutoplay = player.retryKey !== 0 ? (playbackIntentRef.current ?? false) : autoplay;

  const watchUrl = `/watch?v=${encodeURIComponent(toPublicWatchParam(sourceUrl))}`;

  const sponsor = useWatchSponsorBlock(stream, settings);
  const autoSkipSponsorBlock = isAuthed && settings.sponsorBlockMode !== "disabled";

  const { thumbnailVtt, chaptersVtt } = useWatchVttAssets(
    stream,
    sponsor.segments,
    settings.sponsorBlockShowChapters,
  );

  const sabrConfig = useSabrPlaybackConfig(
    stream,
    player.sabrEnabled,
    settings.defaultQuality,
    settings.defaultAudioLanguage,
    false,
  );

  const playerKey = [
    stream.id,
    player.retryKey,
    player.sabrEnabled ? "sabr" : "std",
    thumbnailVtt ? "thumbs" : "no-thumbs",
    chaptersVtt ? "chapters" : "no-chapters",
  ].join(":");

  if (player.playerFailed) {
    return <EmbedError message={PLAYBACK_FAILED_MESSAGE} onRetry={player.reset} />;
  }

  return (
    <EmbedVideoPlayer
      playerKey={playerKey}
      src={player.manifestSrc}
      sabrConfig={sabrConfig}
      audioOnly={false}
      title={stream.title}
      poster={stream.thumbnail}
      subtitles={stream.subtitles}
      startTime={effectiveStartTime}
      autoplay={effectiveAutoplay}
      settingsReady={settingsReady}
      streamType={isLive ? "live" : "on-demand"}
      chaptersVtt={chaptersVtt}
      thumbnailVtt={thumbnailVtt}
      originalAudioLocale={getOriginalAudioLocale(stream)}
      initialVolume={settings.volume}
      initialMuted={settings.muted}
      sponsorBlockSegments={sponsor.segments}
      autoSkipSponsorBlockSegments={isAuthed ? sponsor.autoSkipSegments : []}
      manualSkipSponsorBlockSegments={isAuthed ? sponsor.manualSkipSegments : sponsor.segments}
      autoSkipSponsorBlock={autoSkipSponsorBlock}
      muteSponsorBlockInsteadOfSkip={settings.sponsorBlockMuteInsteadOfSkip}
      showCurrentSponsorBlockSegment={settings.sponsorBlockShowCurrentSegment}
      captionStyles={settings.captionStyles}
      onCaptionStylesChange={(captionStyles) => update.mutate({ captionStyles })}
      onVolumeChange={handleVolumeChange}
      onTimeUpdate={(positionMs) => {
        positionRef.current = positionMs;
      }}
      onPlay={() => {
        playbackIntentRef.current = true;
        player.clearFailed();
      }}
      onPause={() => {
        playbackIntentRef.current = false;
      }}
      onError={handlePlayerError}
      watchUrl={watchUrl}
    />
  );
}
