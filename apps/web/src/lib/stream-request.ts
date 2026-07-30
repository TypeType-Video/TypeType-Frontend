import { API_BASE as BASE } from "./env";
import { detectProvider } from "./provider";

export function streamEndpoint(url: string): string {
  const provider = detectProvider(url);
  const path = providerStreamPath(provider);
  return `${BASE}${path}?url=${encodeURIComponent(url)}`;
}

export function sabrBootstrapEndpoint(url: string): string | null {
  if (detectProvider(url) !== "youtube") return null;
  return `${BASE}/streams/youtube/sabr/bootstrap?url=${encodeURIComponent(url)}`;
}

function providerStreamPath(provider: ReturnType<typeof detectProvider>) {
  if (provider === "youtube") return "/streams/youtube/sabr";
  if (provider === "nicovideo") return "/streams/niconico";
  if (provider === "bilibili") return "/streams/bilibili";
  throw new Error("Unsupported video provider");
}

export function streamQueryKey(
  url: string,
  authenticated: boolean,
): readonly ["stream", string, "auth" | "anon"] {
  return ["stream", url, authenticated ? "auth" : "anon"];
}

export function sabrBootstrapQueryKey(
  url: string,
  authenticated: boolean,
): readonly ["stream-bootstrap", string, "auth" | "anon"] {
  return ["stream-bootstrap", url, authenticated ? "auth" : "anon"];
}
