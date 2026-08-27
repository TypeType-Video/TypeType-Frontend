import { m } from "../paraglide/messages.js";
import { normalizeClientLocale } from "./client-locale";

export function formatViews(views: number): string {
  if (views < 0) return "";
  if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)}B ${m.ui_views()}`;
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M ${m.ui_views()}`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(0)}K ${m.ui_views()}`;
  return `${views} ${m.ui_views()}`;
}

export function formatSubscribers(n: number | undefined): string {
  if (n == null || n < 0) return "";
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B ${m.ui_subscribers()}`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M ${m.ui_subscribers()}`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K ${m.ui_subscribers()}`;
  return `${n} ${m.ui_subscribers()}`;
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function formatLikes(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function relativeLabel(unit: Intl.RelativeTimeFormatUnit, value: number, locale?: string): string {
  const effective = normalizeClientLocale(locale) ?? "en";
  const formatter = new Intl.RelativeTimeFormat(effective, { numeric: "auto" });
  return formatter.format(value, unit);
}

export function formatPublishedDate(
  publishedAt?: number,
  uploadDate?: string,
  locale?: string,
): string {
  if (publishedAt && publishedAt > 0) {
    const diffMs = publishedAt - Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const abs = Math.abs(diffMs);
    if (abs < dayMs) return relativeLabel("hour", Math.round(diffMs / (60 * 60 * 1000)), locale);
    if (abs < 7 * dayMs) return relativeLabel("day", Math.round(diffMs / dayMs), locale);
    if (abs < 30 * dayMs) return relativeLabel("week", Math.round(diffMs / (7 * dayMs)), locale);
    if (abs < 365 * dayMs) return relativeLabel("month", Math.round(diffMs / (30 * dayMs)), locale);
    return relativeLabel("year", Math.round(diffMs / (365 * dayMs)), locale);
  }

  if (uploadDate) {
    const parsed = new Date(uploadDate);
    if (Number.isNaN(parsed.getTime())) return uploadDate;
    return parsed.toLocaleDateString(normalizeClientLocale(locale), {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return "";
}

export function formatExactDate(publishedAt: number | undefined, locale?: string): string {
  if (!publishedAt || publishedAt <= 0) return "";
  const parsed = new Date(publishedAt);
  if (Number.isNaN(parsed.getTime())) return "";
  const effective = normalizeClientLocale(locale);
  return parsed.toLocaleDateString(effective, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
