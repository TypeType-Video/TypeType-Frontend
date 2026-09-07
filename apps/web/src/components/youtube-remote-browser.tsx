import type { KeyboardEvent, PointerEvent } from "react";
import { useEffect, useRef, useState } from "react";
import type { YoutubeRemoteInput, YoutubeRemotePhase } from "../hooks/use-youtube-remote-browser";
import { youtubeRemotePhaseLabel } from "../lib/youtube-remote-phase";
import { mapYoutubeRemotePointer, type RemotePointerSize } from "../lib/youtube-remote-pointer";
import { m } from "../paraglide/messages.js";

type Props = {
  frameUrl: string | null;
  phase: YoutubeRemotePhase;
  error: string | null;
  onInput: (message: YoutubeRemoteInput) => void;
};

function modifiers(event: KeyboardEvent): string[] {
  const next: string[] = [];
  if (event.altKey) next.push("Alt");
  if (event.ctrlKey) next.push("Control");
  if (event.metaKey) next.push("Meta");
  if (event.shiftKey) next.push("Shift");
  return next;
}

function isTextKey(event: KeyboardEvent): boolean {
  return event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey;
}

function isPasteShortcut(event: KeyboardEvent): boolean {
  return event.key.toLowerCase() === "v" && (event.ctrlKey || event.metaKey) && !event.altKey;
}

export function YoutubeRemoteBrowser({ frameUrl, phase, error, onInput }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pointerIdRef = useRef<number | null>(null);
  const [frameSize, setFrameSize] = useState<RemotePointerSize | null>(null);
  const [viewportSize, setViewportSize] = useState<RemotePointerSize | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new ResizeObserver(([entry]) => {
      const width = Math.round(entry.contentRect.width);
      const height = Math.round(entry.contentRect.height);
      if (width <= 0 || height <= 0) return;
      setViewportSize((previous) =>
        previous?.width === width && previous.height === height ? previous : { width, height },
      );
      onInput({ type: "resize", width, height });
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, [onInput]);

  useEffect(() => {
    if (!frameUrl) {
      setFrameSize(null);
      pointerIdRef.current = null;
    }
  }, [frameUrl]);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      onInput({ type: "wheel", deltaX: event.deltaX, deltaY: event.deltaY });
    };
    input.addEventListener("wheel", handleWheel, { passive: false });
    return () => input.removeEventListener("wheel", handleWheel);
  }, [onInput]);

  function point(event: PointerEvent) {
    const rect = event.currentTarget.getBoundingClientRect();
    return mapYoutubeRemotePointer(event.clientX, event.clientY, rect, frameSize, viewportSize);
  }

  function releasePointer(event: PointerEvent) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    pointerIdRef.current = null;
  }

  return (
    <div
      ref={rootRef}
      className="relative aspect-video min-h-[22rem] w-full overflow-hidden border border-border bg-black focus-within:border-fg sm:min-h-[30rem]"
    >
      {frameUrl ? (
        <img
          src={frameUrl}
          alt=""
          className="h-full w-full object-contain"
          onLoad={(event) => {
            setFrameSize({
              width: event.currentTarget.naturalWidth,
              height: event.currentTarget.naturalHeight,
            });
          }}
        />
      ) : null}
      {!frameUrl && (
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
          <span className="text-fg text-sm">
            {m.ui_remote_browser()} {youtubeRemotePhaseLabel(phase)}
          </span>
          <span className="text-fg-soft text-xs">
            {m.ui_the_youtube_sign_in_window_will_appear_here()}
          </span>
          {error && <span className="text-danger-strong text-xs">{error}</span>}
        </span>
      )}
      <textarea
        ref={inputRef}
        aria-label={m.ui_youtube_sign_in_remote_browser()}
        value=""
        onChange={() => undefined}
        className="absolute inset-0 h-full w-full touch-none resize-none cursor-default border-0 bg-transparent p-0 text-base text-transparent caret-transparent outline-none"
        onPointerDown={(event) => {
          if (pointerIdRef.current !== null && pointerIdRef.current !== event.pointerId) return;
          event.preventDefault();
          event.currentTarget.focus();
          event.currentTarget.setPointerCapture(event.pointerId);
          pointerIdRef.current = event.pointerId;
          onInput({ type: "pointer", event: "down", ...point(event), button: "left" });
        }}
        onPointerMove={(event) => {
          if (pointerIdRef.current !== null && pointerIdRef.current !== event.pointerId) return;
          event.preventDefault();
          onInput({ type: "pointer", event: "move", ...point(event), button: "left" });
        }}
        onPointerUp={(event) => {
          event.preventDefault();
          if (pointerIdRef.current === event.pointerId) {
            onInput({ type: "pointer", event: "up", ...point(event), button: "left" });
            releasePointer(event);
          }
        }}
        onPointerCancel={(event) => {
          event.preventDefault();
          if (pointerIdRef.current === event.pointerId) {
            onInput({ type: "pointer", event: "up", ...point(event), button: "left" });
            releasePointer(event);
          }
        }}
        onKeyDown={(event) => {
          if (isPasteShortcut(event)) return;
          event.preventDefault();
          if (isTextKey(event)) {
            onInput({ type: "text", value: event.key });
            return;
          }
          onInput({
            type: "key",
            event: "down",
            key: event.key,
            code: event.code,
            modifiers: modifiers(event),
          });
        }}
        onKeyUp={(event) => {
          if (isPasteShortcut(event)) return;
          event.preventDefault();
          if (!isTextKey(event)) {
            onInput({
              type: "key",
              event: "up",
              key: event.key,
              code: event.code,
              modifiers: modifiers(event),
            });
          }
        }}
        onPaste={(event) => {
          event.preventDefault();
          const value = event.clipboardData.getData("text");
          if (value) onInput({ type: "text", value });
        }}
      />
    </div>
  );
}
