function finitePosition(positionMs: number): number | null {
  return Number.isFinite(positionMs) ? Math.max(0, positionMs) : null;
}

export function resolveWatchPlayerStartTime(
  configuredStartTimeMs: number,
  currentPositionMs: number,
  preserveCurrentPosition: boolean,
): number {
  const configured = finitePosition(configuredStartTimeMs) ?? 0;
  if (!preserveCurrentPosition) return configured;
  return finitePosition(currentPositionMs) ?? configured;
}
