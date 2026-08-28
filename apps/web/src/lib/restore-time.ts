import { normalizeClientLocale } from "./client-locale";

export function formatRestoreTimeRange(
  min: number | null,
  max: number | null,
  locale?: string,
): string | null {
  if (min === null || max === null) return null;
  const effectiveLocale = normalizeClientLocale(locale);
  const from = new Date(min).toLocaleString(effectiveLocale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const to = new Date(max).toLocaleString(effectiveLocale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  return `${from} -> ${to}`;
}
