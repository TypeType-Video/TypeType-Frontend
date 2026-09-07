import { expect, test } from "bun:test";
import {
  progressBatches,
  progressItemsByUrl,
  updateProgressItems,
  videoProgressUrl,
} from "../src/lib/video-progress";
import type { ProgressItem } from "../src/types/user";

test("uses the same canonical URL as the watch route", () => {
  expect(videoProgressUrl({ id: "RjdGmIUbYIQ" })).toBe(
    "https://www.youtube.com/watch?v=RjdGmIUbYIQ",
  );
  expect(videoProgressUrl({ id: "https://youtu.be/RjdGmIUbYIQ?si=share" })).toBe(
    "https://www.youtube.com/watch?v=RjdGmIUbYIQ",
  );
});

test("batches unique progress URLs without dropping entries", () => {
  const urls = Array.from({ length: 201 }, (_, index) => `https://video.test/${index}`);
  const batches = progressBatches([...urls, urls[0]]);
  expect(batches.map((batch) => batch.length)).toEqual([200, 1]);
  expect(batches.flat()).toEqual(urls);
});

test("indexes and updates the exact saved position", () => {
  const initial: ProgressItem[] = [
    { videoUrl: "https://video.test/one", position: 12_345, updatedAt: 1 },
    { videoUrl: "https://video.test/two", position: 0, updatedAt: 0 },
  ];
  const next = { videoUrl: "https://video.test/two", position: 67_890, updatedAt: 2 };
  const updated = updateProgressItems(initial, next) ?? [];
  expect(progressItemsByUrl(updated).get(next.videoUrl)).toEqual(next);
  expect(updated[0]).toEqual(initial[0]);
});
