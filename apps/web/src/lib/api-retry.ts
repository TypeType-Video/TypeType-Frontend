import { ApiError } from "./api";

const TEMPORARY_STATUSES = new Set([429, 503, 504]);
const MAX_RETRY_WAIT_MS = 15_000;
const MAX_TEMPORARY_RETRIES = 2;
const MAX_SERVER_RETRIES = 3;

export function isTemporaryApiError(error: unknown): boolean {
  return error instanceof ApiError && TEMPORARY_STATUSES.has(error.status);
}

export function shouldRetryApiError(failureCount: number, error: unknown): boolean {
  if (!(error instanceof ApiError)) return failureCount < MAX_SERVER_RETRIES;
  if (TEMPORARY_STATUSES.has(error.status)) {
    if (error.retryAfterMs !== null && error.retryAfterMs > MAX_RETRY_WAIT_MS) return false;
    return failureCount < MAX_TEMPORARY_RETRIES;
  }
  if (error.status >= 400 && error.status < 500) return false;
  return failureCount < MAX_SERVER_RETRIES;
}

export function apiRetryDelay(attempt: number, error: unknown): number {
  if (error instanceof ApiError && error.retryAfterMs !== null) {
    return Math.min(error.retryAfterMs, MAX_RETRY_WAIT_MS);
  }
  return Math.min(300 * 2 ** attempt, 1500);
}
