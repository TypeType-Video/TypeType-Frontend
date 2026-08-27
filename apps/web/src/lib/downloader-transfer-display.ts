import { m } from "../paraglide/messages.js";

export function formatTransferBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return m.ui_unknown();
  const units = ["B", "KiB", "MiB", "GiB", "TiB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const decimals = value >= 100 || unit === 0 ? 0 : value >= 10 ? 1 : 2;
  return `${value.toFixed(decimals)} ${units[unit]}`;
}

export function estimateTransferRate(
  downloadedBytes: number | null,
  totalBytes: number | null,
  etaSeconds: number | null,
): number | null {
  if (downloadedBytes === null || totalBytes === null || etaSeconds === null) return null;
  if (etaSeconds <= 0 || totalBytes <= downloadedBytes) return null;
  return (totalBytes - downloadedBytes) / etaSeconds;
}

export function formatEta(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return m.ui_unknown();
  const rounded = Math.ceil(seconds);
  if (rounded < 60) return m.ui_seconds_left({ count: rounded });
  const minutes = Math.floor(rounded / 60);
  const remainder = rounded % 60;
  if (minutes < 60) return m.ui_minutes_seconds_left({ minutes, seconds: remainder });
  const hours = Math.floor(minutes / 60);
  return m.ui_hours_minutes_left({ hours, minutes: minutes % 60 });
}
