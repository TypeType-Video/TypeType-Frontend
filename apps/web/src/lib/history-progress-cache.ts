import type { InfiniteData } from "@tanstack/react-query";
import type { HistoryItem } from "../types/user";

export type HistoryPageData = {
  items: HistoryItem[];
  total: number;
};

export type HistoryPagesData = InfiniteData<HistoryPageData, number>;

function updateItems(items: HistoryItem[], videoUrl: string, progress: number): HistoryItem[] {
  const index = items.findIndex((item) => item.url === videoUrl);
  if (index < 0 || items[index].progress === progress) return items;
  const next = [...items];
  next[index] = { ...items[index], progress };
  return next;
}

export function updateHistoryPageProgress(
  data: HistoryPageData | undefined,
  videoUrl: string,
  positionMs: number,
): HistoryPageData | undefined {
  if (!data) return data;
  const items = updateItems(data.items, videoUrl, Math.max(0, Math.round(positionMs / 1000)));
  return items === data.items ? data : { ...data, items };
}

export function updateHistoryPagesProgress(
  data: HistoryPagesData | undefined,
  videoUrl: string,
  positionMs: number,
): HistoryPagesData | undefined {
  if (!data) return data;
  const pages = data.pages.map(
    (page) => updateHistoryPageProgress(page, videoUrl, positionMs) ?? page,
  );
  return pages.every((page, index) => page === data.pages[index]) ? data : { ...data, pages };
}
