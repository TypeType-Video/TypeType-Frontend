export type Provider = "youtube" | "nicovideo" | "bilibili" | "unknown";

export function detectProvider(url: string): Provider {
  const normalized = url.toLowerCase();
  if (normalized.includes("youtube.com") || normalized.includes("youtu.be")) return "youtube";
  if (normalized.includes("nicovideo.jp") || normalized.includes("nico.ms")) return "nicovideo";
  if (normalized.includes("bilibili.com") || normalized.includes("b23.tv")) return "bilibili";
  return "unknown";
}
