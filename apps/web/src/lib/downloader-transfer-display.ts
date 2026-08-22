export function formatTransferBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "Unknown";
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
  if (!Number.isFinite(seconds) || seconds < 0) return "Unknown";
  const rounded = Math.ceil(seconds);
  if (rounded < 60) return `${rounded}s left`;
  const minutes = Math.floor(rounded / 60);
  const remainder = rounded % 60;
  if (minutes < 60) return `${minutes}m ${remainder}s left`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m left`;
}
