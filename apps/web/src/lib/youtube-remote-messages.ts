export type YoutubeRemotePhase =
  | "idle"
  | "connecting"
  | "opening"
  | "awaiting_login"
  | "capturing_session"
  | "connected"
  | "closed"
  | "error";

export type YoutubeRemoteMessage =
  | { type: "status"; phase: YoutubeRemotePhase }
  | { type: "error"; message: string }
  | { type: "log"; at: number; message: string };

export type YoutubeRemoteLogLine = {
  at: number;
  source: "token" | "client";
  message: string;
};

export const MAX_REMOTE_LOG_LINES = 300;

const PHASES: readonly YoutubeRemotePhase[] = [
  "idle",
  "connecting",
  "opening",
  "awaiting_login",
  "capturing_session",
  "connected",
  "closed",
  "error",
];

function isYoutubeRemotePhase(value: string): value is YoutubeRemotePhase {
  return (PHASES as readonly string[]).includes(value);
}

export function parseYoutubeRemoteMessage(value: string): YoutubeRemoteMessage | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object" || !("type" in parsed)) return null;
  const record = parsed as Record<string, unknown>;
  if (
    record.type === "status" &&
    typeof record.phase === "string" &&
    isYoutubeRemotePhase(record.phase)
  ) {
    return { type: "status", phase: record.phase };
  }
  if (record.type === "error" && typeof record.message === "string") {
    return { type: "error", message: record.message };
  }
  if (
    record.type === "log" &&
    typeof record.message === "string" &&
    typeof record.at === "number"
  ) {
    return { type: "log", at: Math.max(0, Math.trunc(record.at)), message: record.message };
  }
  return null;
}

export function appendYoutubeRemoteLog(
  lines: YoutubeRemoteLogLine[],
  line: YoutubeRemoteLogLine,
): YoutubeRemoteLogLine[] {
  const next = [...lines, line];
  return next.length > MAX_REMOTE_LOG_LINES ? next.slice(next.length - MAX_REMOTE_LOG_LINES) : next;
}

function formatYoutubeRemoteLog(line: YoutubeRemoteLogLine): string {
  const seconds = (line.at / 1000).toFixed(1).padStart(6, " ");
  return `${seconds}s [${line.source}] ${line.message}`;
}

export function formatYoutubeRemoteLogs(lines: YoutubeRemoteLogLine[]): string {
  return lines.map(formatYoutubeRemoteLog).join("\n");
}
