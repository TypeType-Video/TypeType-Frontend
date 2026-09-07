import { useCallback, useEffect, useRef, useState } from "react";
import { recordClientEvent } from "../lib/client-debug-log";
import { createYoutubeRemoteInputQueue } from "../lib/youtube-remote-input-queue";
import { m } from "../paraglide/messages.js";

export type YoutubeRemotePhase =
  | "idle"
  | "connecting"
  | "opening"
  | "awaiting_login"
  | "capturing_session"
  | "connected"
  | "closed"
  | "error";

export type YoutubeRemoteInput =
  | { type: "resize"; width: number; height: number }
  | { type: "pointer"; event: "down"; x: number; y: number; button: "left" }
  | { type: "pointer"; event: "up"; x: number; y: number; button: "left" }
  | { type: "pointer"; event: "move"; x: number; y: number; button: "left" }
  | { type: "wheel"; deltaX: number; deltaY: number }
  | { type: "key"; event: "down" | "up"; key: string; code: string; modifiers: string[] }
  | { type: "text"; value: string }
  | { type: "cancel" };

type RemoteStatus = {
  type: "status";
  phase: YoutubeRemotePhase;
};

type RemoteError = {
  type: "error";
  message: string;
};

function isYoutubeRemotePhase(value: string): value is YoutubeRemotePhase {
  return (
    value === "idle" ||
    value === "connecting" ||
    value === "opening" ||
    value === "awaiting_login" ||
    value === "capturing_session" ||
    value === "connected" ||
    value === "closed" ||
    value === "error"
  );
}

function parseRemoteMessage(value: string): RemoteStatus | RemoteError | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object" || !("type" in parsed)) return null;
  if (
    parsed.type === "status" &&
    "phase" in parsed &&
    typeof parsed.phase === "string" &&
    isYoutubeRemotePhase(parsed.phase)
  ) {
    return { type: "status", phase: parsed.phase };
  }
  if (parsed.type === "error" && "message" in parsed && typeof parsed.message === "string") {
    return { type: "error", message: parsed.message };
  }
  return null;
}

export function useYoutubeRemoteBrowser(wsUrl: string | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const frameRef = useRef<string | null>(null);
  const inputCountRef = useRef(0);
  const lastResizeRef = useRef<Extract<YoutubeRemoteInput, { type: "resize" }> | null>(null);
  const inputQueueRef = useRef<ReturnType<typeof createYoutubeRemoteInputQueue> | null>(null);
  const [phase, setPhase] = useState<YoutubeRemotePhase>(wsUrl ? "connecting" : "idle");
  const [frameUrl, setFrameUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sendImmediate = useCallback((message: YoutubeRemoteInput) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      recordClientEvent("youtube_remote.input_dropped", { type: message.type });
      return false;
    }
    ws.send(JSON.stringify(message));
    inputCountRef.current += 1;
    if (
      message.type !== "pointer" ||
      message.event !== "move" ||
      inputCountRef.current % 25 === 0
    ) {
      recordClientEvent("youtube_remote.input_sent", {
        type: message.type,
        event: "event" in message ? message.event : null,
        length: message.type === "text" ? message.value.length : null,
      });
    }
    return true;
  }, []);

  const canSend = useCallback(() => {
    const ws = wsRef.current;
    return ws !== null && ws.readyState === WebSocket.OPEN;
  }, []);

  if (inputQueueRef.current === null) {
    inputQueueRef.current = createYoutubeRemoteInputQueue({ canSend, sendImmediate });
  }

  useEffect(() => {
    if (!wsUrl) {
      lastResizeRef.current = null;
      setPhase("idle");
      setError(null);
      return;
    }

    let active = true;
    let finished = false;
    let frameCount = 0;
    setPhase("connecting");
    setError(null);
    const ws = new WebSocket(wsUrl);
    ws.binaryType = "blob";
    wsRef.current = ws;

    recordClientEvent("youtube_remote.ws_connecting", { hasUrl: true });

    ws.onopen = () => {
      if (!active) return;
      recordClientEvent("youtube_remote.ws_open");
      if (lastResizeRef.current) sendImmediate(lastResizeRef.current);
    };

    ws.onmessage = (event) => {
      if (!active) return;
      if (typeof event.data === "string") {
        const message = parseRemoteMessage(event.data);
        if (message?.type === "status") {
          if (message.phase === "connected") finished = true;
          setPhase(message.phase);
          recordClientEvent("youtube_remote.status", { phase: message.phase });
        }
        if (message?.type === "error") {
          setPhase("error");
          setError(m.ui_remote_browser_error());
          recordClientEvent("youtube_remote.backend_error", { message: message.message });
        }
        return;
      }
      const blob = event.data instanceof Blob ? event.data : new Blob([event.data]);
      const nextUrl = URL.createObjectURL(blob);
      if (frameRef.current) URL.revokeObjectURL(frameRef.current);
      frameRef.current = nextUrl;
      setFrameUrl(nextUrl);
      frameCount += 1;
      if (frameCount === 1 || frameCount % 50 === 0) {
        recordClientEvent("youtube_remote.frame", { count: frameCount, bytes: blob.size });
      }
    };

    ws.onerror = () => {
      if (!active) return;
      finished = true;
      setPhase("error");
      setError(m.ui_remote_browser_connection_failed());
      recordClientEvent("youtube_remote.ws_error");
    };

    ws.onclose = () => {
      if (!active) return;
      recordClientEvent("youtube_remote.ws_close", { finished });
      if (!finished) setPhase("closed");
    };

    return () => {
      active = false;
      ws.close();
      wsRef.current = null;
      if (frameRef.current) URL.revokeObjectURL(frameRef.current);
      frameRef.current = null;
      inputQueueRef.current?.reset();
      setFrameUrl(null);
    };
  }, [wsUrl, sendImmediate]);

  const send = useCallback(
    (message: YoutubeRemoteInput) => {
      if (message.type === "resize") lastResizeRef.current = message;
      return inputQueueRef.current?.send(message) ?? sendImmediate(message);
    },
    [sendImmediate],
  );

  return { phase, frameUrl, error, send };
}
