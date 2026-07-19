export function parseStartTime(raw?: string | number): number {
  if (raw == null) return 0;
  if (typeof raw === "number") {
    if (!Number.isFinite(raw)) return 0;
    return Math.max(0, Math.floor(raw));
  }
  const trimmed = raw.trim();
  if (!trimmed) return 0;
  const num = Number(trimmed);
  if (Number.isFinite(num)) return Math.max(0, Math.floor(num));
  const match = trimmed.match(/^(?:(\d+)h)?\s*(?:(\d+)m)?\s*(?:(\d+)s?)?$/);
  if (!match) return 0;
  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);
  return hours * 3600 + minutes * 60 + seconds;
}
