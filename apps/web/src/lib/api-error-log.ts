import type { BugApiErrorItem } from "../types/bug-report";
import { createBatchedWriter } from "./batched-writer";
import { sanitizeDebugText, sanitizeRequestPath } from "./debug-sanitize";

const STORAGE_KEY = "typed-api-error-log";
const MAX_ENTRIES = 100;
const TTL_MS = 30 * 60 * 1000;
const FLUSH_DELAY_MS = 250;

type StoredApiErrors = {
  updatedAt: number;
  entries: BugApiErrorItem[];
};

type ApiErrorInput = {
  endpoint: string;
  status?: number;
  code?: string | null;
  message?: string;
  requestId?: string | null;
  timestamp?: number;
};

let cachedErrors: StoredApiErrors | null = null;
let lifecycleInstalled = false;

function canUseSessionStorage(): boolean {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

function isBugApiErrorItem(value: unknown): value is BugApiErrorItem {
  if (!value || typeof value !== "object") return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.endpoint === "string" &&
    typeof entry.status === "number" &&
    (typeof entry.code === "string" || entry.code === null) &&
    typeof entry.message === "string" &&
    (typeof entry.requestId === "string" || entry.requestId === null) &&
    typeof entry.timestamp === "number"
  );
}

function normalizeStatus(status: number | undefined): number {
  if (typeof status !== "number" || !Number.isFinite(status) || status <= 0) return 520;
  return Math.floor(status);
}

function normalizeEntry(input: ApiErrorInput): BugApiErrorItem {
  const code = input.code ? sanitizeDebugText(input.code) : null;
  const requestId = input.requestId ? sanitizeDebugText(input.requestId) : null;
  const message = sanitizeDebugText(input.message ?? "Request failed");
  return {
    endpoint: sanitizeRequestPath(input.endpoint),
    status: normalizeStatus(input.status),
    code,
    message,
    requestId,
    timestamp: input.timestamp ?? Date.now(),
  };
}

function readStoredApiErrors(): StoredApiErrors {
  if (cachedErrors) return cachedErrors;
  if (!canUseSessionStorage()) return { updatedAt: Date.now(), entries: [] };
  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return { updatedAt: Date.now(), entries: [] };
  try {
    const parsed = JSON.parse(raw) as { updatedAt?: unknown; entries?: unknown };
    const updatedAt = typeof parsed.updatedAt === "number" ? parsed.updatedAt : 0;
    if (Date.now() - updatedAt > TTL_MS) return { updatedAt: Date.now(), entries: [] };
    const entries = Array.isArray(parsed.entries)
      ? parsed.entries.filter(isBugApiErrorItem).map((entry) => normalizeEntry(entry))
      : [];
    cachedErrors = { updatedAt, entries };
    return cachedErrors;
  } catch {
    cachedErrors = { updatedAt: Date.now(), entries: [] };
    return cachedErrors;
  }
}

const persistence = createBatchedWriter(() => {
  if (!cachedErrors || !canUseSessionStorage()) return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cachedErrors));
}, FLUSH_DELAY_MS);

function installLifecycleFlush(): void {
  if (lifecycleInstalled || typeof window === "undefined") return;
  lifecycleInstalled = true;
  window.addEventListener("pagehide", persistence.flush);
}

function writeStoredApiErrors(entries: BugApiErrorItem[], immediate = false): void {
  cachedErrors = { updatedAt: Date.now(), entries };
  if (!canUseSessionStorage()) return;
  installLifecycleFlush();
  if (immediate) {
    persistence.flush();
    return;
  }
  persistence.schedule();
}

export function recordApiError(input: ApiErrorInput): void {
  const entry = normalizeEntry(input);
  const stored = readStoredApiErrors();
  const nextEntries = [...stored.entries, entry].slice(-MAX_ENTRIES);
  writeStoredApiErrors(nextEntries);
}

export function getApiErrors(): BugApiErrorItem[] {
  return [...readStoredApiErrors().entries];
}

export function clearApiErrors(): void {
  writeStoredApiErrors([], true);
}
