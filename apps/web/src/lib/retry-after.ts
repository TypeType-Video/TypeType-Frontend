export function parseRetryAfterMs(value: string | null, now = Date.now()): number | null {
  const text = value?.trim();
  if (!text) return null;
  if (/^\d+$/.test(text)) return Number(text) * 1000;
  const date = Date.parse(text);
  return Number.isNaN(date) ? null : Math.max(0, date - now);
}
