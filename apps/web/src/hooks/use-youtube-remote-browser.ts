import { useCallback, useEffect, useRef, useState } from "react";
import { recordClientEvent } from "../lib/client-debug-log";
import { createYoutubeRemoteInputQueue } from "../lib/youtube-remote-input-queue";
import {
  appendYoutubeRemoteLog,
  parseYoutubeRemoteMessage,
  type YoutubeRemoteLogLine,
  type YoutubeRemotePhase,
} from "../lib/youtube-remote-messages";
import { m } from "../paraglide/messages.js";

export type { YoutubeRemotePhase } from "../lib/youtube-remote-messages";

export type YoutubeRemoteInput =
  | { type: "resize"; width: number; height: number }
  | { type: "pointer"; event: "down"; x: number; y: number; button: "left" }
  | { type: "pointer"; event: "up"; x: number; y: number; button: "left" }
  | { type: "pointer"; event: "move"; x: number; y: number; button: "left" }
  | { type: "wheel"; deltaX: number; deltaY: number }
  | { type: "key"; event: "down" | "up"; key: string; code: string; modifiers: string[] }
  | { type: "text"; value: string }
  | { type: "cancel" };

export function useYoutubeRemoteBrowser(wsUrl: string | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const frameRef = useRef<string | null>(null);
  const inputCountRef = useRef(0);
  const lastResizeRef = useRef<Extract<YoutubeRemoteInput, { type: "resize" }> | null>(null);
  const inputQueueRef = useRef<ReturnType<typeof createYoutubeRemoteInputQueue> | null>(null);
  const startedAtRef = useRef(Date.now());
  const [phase, setPhase] = useState<YoutubeRemotePhase>(wsUrl ? "connecting" : "idle");
  const [frameUrl, setFrameUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<YoutubeRemoteLogLine[]>([]);

  const pushLog = useCallback(
    (source: YoutubeRemoteLogLine["source"], message: string, at?: number) => {
      const line = { at: at ?? Date.now() - startedAtRef.current, source, message };
      setLogs((previous) => appendYoutubeRemoteLog(previous, line));
    },
    [],
  );

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
    startedAtRef.current = Date.now();
    setLogs([]);
    setPhase("connecting");
    setError(null);
    const ws = new WebSocket(wsUrl);
    ws.binaryType = "blob";
    wsRef.current = ws;

    recordClientEvent("youtube_remote.ws_connecting", { hasUrl: true });
    pushLog("client", `websocket connecting ${navigator.userAgent}`);

    ws.onopen = () => {
      if (!active) return;
      recordClientEvent("youtube_remote.ws_open");
      pushLog("client", "websocket open");
      if (lastResizeRef.current) sendImmediate(lastResizeRef.current);
    };

    ws.onmessage = (event) => {
      if (!active) return;
      if (typeof event.data === "string") {
        const message = parseYoutubeRemoteMessage(event.data);
        if (message?.type === "log") {
          pushLog("token", message.message, message.at);
          recordClientEvent("youtube_remote.token_log", {
            at: message.at,
            message: message.message,
          });
        }
        if (message?.type === "status") {
          if (message.phase === "connected") finished = true;
          setPhase(message.phase);
          recordClientEvent("youtube_remote.status", { phase: message.phase });
          pushLog("client", `status ${message.phase}`);
        }
        if (message?.type === "error") {
          setPhase("error");
          setError(m.ui_remote_browser_error());
          recordClientEvent("youtube_remote.backend_error", { message: message.message });
          pushLog("client", `backend error: ${message.message}`);
        }
        if (!message) pushLog("client", `unreadable text message ${event.data.slice(0, 80)}`);
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
        pushLog("client", `frame #${frameCount} ${blob.size} bytes`);
      }
    };

    ws.onerror = () => {
      if (!active) return;
      finished = true;
      setPhase("error");
      setError(m.ui_remote_browser_connection_failed());
      recordClientEvent("youtube_remote.ws_error");
      pushLog("client", "websocket error");
    };

    ws.onclose = (event) => {
      if (!active) return;
      recordClientEvent("youtube_remote.ws_close", { finished });
      pushLog(
        "client",
        `websocket closed code=${event.code} reason=${event.reason} finished=${finished}`,
      );
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
  }, [wsUrl, sendImmediate, pushLog]);

  const send = useCallback(
    (message: YoutubeRemoteInput) => {
      if (message.type === "resize") lastResizeRef.current = message;
      return inputQueueRef.current?.send(message) ?? sendImmediate(message);
    },
    [sendImmediate],
  );

  return { phase, frameUrl, error, logs, send };
}
