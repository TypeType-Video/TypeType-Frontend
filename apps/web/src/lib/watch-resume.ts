type WatchResumeInput = {
  authenticated: boolean;
  progressPending: boolean;
  savedPositionMs?: number;
  serverPositionSeconds?: number;
  durationSeconds: number;
};

export function resolveWatchStartTime(input: WatchResumeInput): number | null {
  if (input.authenticated && input.progressPending) return null;

  const savedPositionMs = input.savedPositionMs ?? 0;
  const serverPositionMs = (input.serverPositionSeconds ?? 0) * 1000;
  const resumeMs = savedPositionMs > 0 ? savedPositionMs : serverPositionMs;
  const durationMs = input.durationSeconds * 1000;
  return resumeMs >= 5000 && resumeMs < durationMs * 0.95 ? resumeMs : 0;
}
