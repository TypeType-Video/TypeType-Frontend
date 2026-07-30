import { ApiError } from "./api";
import { authed } from "./authed";
import { API_BASE as BASE } from "./env";

export type PipePipeTimeMode = "raw" | "normalized";
export type TypeTypeBackupCategory =
  | "subscriptions"
  | "history"
  | "playlists"
  | "watchLater"
  | "favorites"
  | "progress"
  | "searchHistory"
  | "savedPlaylists"
  | "settings"
  | "contentFilters";

export type TypeTypeRestoreSummary = {
  restored: Record<string, number>;
};

export type PipePipeRestoreSummary = {
  history: number;
  subscriptions: number;
  playlists: number;
  playlistVideos: number;
  progress: number;
  searchHistory: number;
  timeMode: PipePipeTimeMode;
  historyMinWatchedAt: number | null;
  historyMaxWatchedAt: number | null;
};

type ErrorPayload = {
  error?: string;
};

function readErrorMessage(payload: unknown, fallback = "Restore failed"): string {
  if (!payload || typeof payload !== "object") return fallback;
  const candidate = payload as ErrorPayload;
  if (typeof candidate.error === "string" && candidate.error.length > 0) return candidate.error;
  return fallback;
}

function downloadName(response: Response): string {
  const disposition = response.headers.get("Content-Disposition") ?? "";
  const match = disposition.match(/filename="?([^";]+)"?/i);
  return match?.[1] ?? `typetype-backup-${new Date().toISOString().slice(0, 10)}.json`;
}

export async function downloadTypeTypeBackup(
  categories: readonly TypeTypeBackupCategory[],
): Promise<void> {
  const search = new URLSearchParams({ categories: categories.join(",") });
  const response = await authed(`${BASE}/backup/typetype?${search.toString()}`);
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new ApiError(readErrorMessage(payload, "Export failed"), response.status);
  }
  const url = URL.createObjectURL(await response.blob());
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = downloadName(response);
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export async function restoreTypeType(file: File): Promise<TypeTypeRestoreSummary> {
  const body = new FormData();
  body.append("file", file);
  const response = await authed(`${BASE}/restore/typetype`, { method: "POST", body });
  const payload = (await response.json().catch(() => ({}))) as
    | TypeTypeRestoreSummary
    | ErrorPayload;
  if (!response.ok) {
    throw new ApiError(readErrorMessage(payload), response.status);
  }
  return payload as TypeTypeRestoreSummary;
}

export async function restorePipePipe(
  file: File,
  timeMode: PipePipeTimeMode,
): Promise<PipePipeRestoreSummary> {
  const body = new FormData();
  body.append("file", file);
  const search = new URLSearchParams({ timeMode });
  const res = await authed(`${BASE}/restore/pipepipe?${search.toString()}`, {
    method: "POST",
    body,
  });
  const payload = (await res.json().catch(() => ({}))) as PipePipeRestoreSummary | ErrorPayload;
  if (!res.ok) {
    if (res.status === 429) {
      const retryAfter = res.headers.get("Retry-After");
      const suffix = retryAfter ? ` Try again in ${retryAfter}s.` : "";
      throw new ApiError(readErrorMessage(payload, `Too many restore attempts.${suffix}`), 429);
    }
    throw new ApiError(readErrorMessage(payload), res.status);
  }
  return payload as PipePipeRestoreSummary;
}
