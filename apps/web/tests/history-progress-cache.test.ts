import { expect, test } from "bun:test";
import {
  updateHistoryPageProgress,
  updateHistoryPagesProgress,
} from "../src/lib/history-progress-cache";
import type { HistoryItem } from "../src/types/user";

function item(url: string, progress: number): HistoryItem {
  return {
    id: url,
    url,
    title: url,
    thumbnail: "",
    channelName: "channel",
    channelUrl: "channel",
    duration: 600,
    progress,
    watchedAt: 1,
  };
}

test("updates only the matching cached history item", () => {
  const page = { items: [item("video-a", 10), item("video-b", 20)], total: 2 };
  const updated = updateHistoryPageProgress(page, "video-b", 42_600);

  expect(updated).not.toBe(page);
  expect(updated?.items[0]).toBe(page.items[0]);
  expect(updated?.items[1].progress).toBe(43);
});

test("keeps cached history identity when the video is absent", () => {
  const page = { items: [item("video-a", 10)], total: 1 };
  const pages = { pages: [page], pageParams: [0] };

  expect(updateHistoryPagesProgress(pages, "missing", 20_000)).toBe(pages);
});

test("updates matching items across loaded history pages", () => {
  const first = { items: [item("video-a", 10)], total: 2 };
  const second = { items: [item("video-b", 20)], total: 2 };
  const updated = updateHistoryPagesProgress(
    { pages: [first, second], pageParams: [0, 40] },
    "video-b",
    55_400,
  );

  expect(updated?.pages[0]).toBe(first);
  expect(updated?.pages[1].items[0].progress).toBe(55);
});
