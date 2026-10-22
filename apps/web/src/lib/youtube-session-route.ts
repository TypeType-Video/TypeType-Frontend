export function youtubeSessionReturnToForWatch(
  v: string,
  list: string | undefined,
  shuffle: string | undefined,
): string {
  const params = new URLSearchParams({ v });
  if (list) params.set("list", list);
  if (shuffle) params.set("shuffle", shuffle);
  return `/watch?${params.toString()}`;
}

export function youtubeSessionReturnToForShorts(v: string): string {
  return `/shorts?${new URLSearchParams({ v }).toString()}`;
}

export function sanitizeYoutubeSessionReturnTo(value: unknown): string | undefined {
  if (typeof value !== "string" || value.length > 800) {
    return undefined;
  }
  let url: URL;
  try {
    url = new URL(value, "https://typetype.invalid");
  } catch {
    return undefined;
  }
  if (url.origin !== "https://typetype.invalid") return undefined;
  const v = url.searchParams.get("v")?.trim();
  if (!v) return undefined;
  if (url.pathname === "/shorts") return youtubeSessionReturnToForShorts(v);
  if (url.pathname !== "/watch") return undefined;
  return youtubeSessionReturnToForWatch(
    v,
    url.searchParams.get("list") ?? undefined,
    url.searchParams.get("shuffle") ?? undefined,
  );
}
