import { useRef, useState } from "react";
import { useAuth } from "../hooks/use-auth";
import { useFavoriteStatus } from "../hooks/use-favorite-status";
import { useInterfaceLocale } from "../hooks/use-interface-locale";
import { useShareUrl } from "../hooks/use-share-url";
import type { WatchAudioOnlyControls } from "../hooks/use-watch-audio-only-playback";
import { prepareAudioSpectrum } from "../lib/audio-spectrum";
import { detectProvider } from "../lib/provider";
import { goto } from "../lib/route-redirect";
import { toPublicWatchUrl } from "../lib/watch-url";
import { m } from "../paraglide/messages.js";
import type { VideoStream } from "../types/stream";
import { DanmakuControls } from "./danmaku-controls";
import { DownloadSheet } from "./download-sheet";
import { PlaylistAddDropdown } from "./playlist-add-dropdown";
import { ReportBugModal } from "./report-bug-modal";
import { Toast } from "./toast";
import { WatchActionButton } from "./watch-action-button";
import {
  BugIcon,
  DownloadIcon,
  HeadphonesIcon,
  ListPlusIcon,
  ShareIcon,
  StarIcon,
} from "./watch-icons";
import { WatchMoreActions } from "./watch-more-actions";

type Props = {
  stream: VideoStream;
  audioOnly: WatchAudioOnlyControls;
};
export function WatchActions({ stream, audioOnly }: Props) {
  const { locale } = useInterfaceLocale();
  const { copied, share } = useShareUrl();
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [toastLabel, setToastLabel] = useState<string | null>(null);
  const saveAnchorRef = useRef<HTMLButtonElement>(null);
  const { authReady, isAuthed } = useAuth();
  const {
    add: addFavorite,
    remove: removeFavorite,
    isFavorite: favorited,
    isPending: favPending,
  } = useFavoriteStatus(stream.id);
  const isNicoNico = detectProvider(stream.id) === "nicovideo";
  const isLive = stream.streamType === "live_stream" || stream.streamType === "audio_live_stream";
  const audioOnlyAvailable = !isLive;
  const audioOnlyDisabled = !authReady || audioOnly.loading;

  function handleSaved(label: string) {
    setToastLabel(label);
    setTimeout(() => setToastLabel(null), 2000);
  }
  async function handleFavorite() {
    if (!isAuthed) {
      goto("/");
      return;
    }
    if (favorited) {
      await removeFavorite();
      handleSaved(m.watch_removed_favorites({}, { locale }));
    } else {
      await addFavorite();
      handleSaved(m.watch_saved_favorites({}, { locale }));
    }
  }

  function handleDownloadMock() {
    setDownloadOpen(true);
  }

  function handleAudioOnly() {
    if (!audioOnly.active) prepareAudioSpectrum();
    audioOnly.onToggle();
  }

  const showSave = true;
  const showReport = true;
  const showDanmaku = isNicoNico;

  return (
    <div className="flex items-center gap-1 flex-wrap">
      <WatchActionButton
        onClick={handleFavorite}
        disabled={favPending || !isAuthed}
        pressed={favorited}
        active={favorited}
      >
        <StarIcon filled={favorited} />
        {favPending
          ? m.watch_saving({}, { locale })
          : favorited
            ? m.watch_favorited({}, { locale })
            : m.watch_favorite({}, { locale })}
      </WatchActionButton>
      <WatchActionButton onClick={handleDownloadMock}>
        <DownloadIcon />
        {m.watch_download({}, { locale })}
      </WatchActionButton>
      {audioOnlyAvailable && (
        <WatchActionButton
          onClick={handleAudioOnly}
          disabled={audioOnlyDisabled}
          pressed={audioOnly.active}
          active={audioOnly.active}
        >
          <HeadphonesIcon />
          {audioOnly.loading
            ? m.watch_audio_loading({}, { locale })
            : m.watch_audio_only({}, { locale })}
        </WatchActionButton>
      )}
      <WatchActionButton onClick={() => share(toPublicWatchUrl(stream.id, window.location.origin))}>
        <ShareIcon />
        {m.watch_share({}, { locale })}
      </WatchActionButton>
      <Toast message={copied ? m.watch_link_copied({}, { locale }) : toastLabel} />
      {showSave && (
        <button
          ref={saveAnchorRef}
          type="button"
          onClick={() => setPlaylistOpen((o) => !o)}
          disabled={!isAuthed}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            playlistOpen
              ? "text-fg bg-surface-strong"
              : "text-fg-muted hover:text-fg hover:bg-surface-strong"
          }`}
        >
          <ListPlusIcon />
          {m.watch_save({}, { locale })}
        </button>
      )}
      <WatchMoreActions
        stream={stream}
        isAuthed={isAuthed}
        onSaved={handleSaved}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors text-fg-muted hover:text-fg hover:bg-surface-strong"
      />
      {showDanmaku && <DanmakuControls />}
      {showReport && isAuthed && (
        <WatchActionButton onClick={() => setReportOpen(true)}>
          <BugIcon />
          {m.watch_report({}, { locale })}
        </WatchActionButton>
      )}
      {playlistOpen && (
        <PlaylistAddDropdown
          stream={stream}
          anchorEl={saveAnchorRef.current}
          onClose={() => setPlaylistOpen(false)}
          onSaved={handleSaved}
        />
      )}
      {downloadOpen && (
        <DownloadSheet
          stream={stream}
          onClose={() => setDownloadOpen(false)}
          onDone={(message) => handleSaved(message)}
        />
      )}
      {reportOpen && <ReportBugModal videoUrl={stream.id} onClose={() => setReportOpen(false)} />}
    </div>
  );
}
