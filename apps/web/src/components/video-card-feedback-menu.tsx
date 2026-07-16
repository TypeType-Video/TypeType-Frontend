import { lazy, Suspense, useEffect, useRef, useState } from "react";
import type { VideoStream } from "../types/stream";
import { Toast } from "./toast";
import { MoreIcon } from "./watch-icons";

const VideoCardFeedbackPanel = lazy(() =>
  import("./video-card-feedback-panel").then((module) => ({
    default: module.VideoCardFeedbackPanel,
  })),
);

type Props = {
  stream: VideoStream;
};

export function VideoCardFeedbackMenu({ stream }: Props) {
  const menuRef = useRef<HTMLButtonElement | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(
    () => () => {
      if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    },
    [],
  );

  function handleSaved(message: string) {
    setToast(message);
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2000);
  }

  return (
    <>
      <button
        ref={menuRef}
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        className="rounded-md p-1 text-fg-muted transition-colors hover:bg-surface-strong hover:text-fg"
        aria-label="Video options"
      >
        <MoreIcon />
      </button>
      {menuOpen && (
        <Suspense fallback={null}>
          <VideoCardFeedbackPanel
            stream={stream}
            anchorEl={menuRef.current}
            onClose={() => setMenuOpen(false)}
            onSaved={handleSaved}
          />
        </Suspense>
      )}
      <Toast message={toast} />
    </>
  );
}
