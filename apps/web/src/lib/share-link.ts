import { detectProvider, type Provider } from "./provider";
import { toWatchSourceUrl } from "./watch-url";

export type ShareProvider = Exclude<Provider, "unknown">;

export type SourceShareTarget = {
  provider: ShareProvider;
  label: string;
  url: string;
};

const PROVIDER_LABELS: Record<ShareProvider, string> = {
  youtube: "YouTube",
  nicovideo: "NicoNico",
  bilibili: "BiliBili",
};

export function getSourceShareTarget(value: string): SourceShareTarget | null {
  const url = toWatchSourceUrl(value);
  const provider = detectProvider(url);
  if (provider === "unknown") return null;
  return { provider, label: PROVIDER_LABELS[provider], url };
}
