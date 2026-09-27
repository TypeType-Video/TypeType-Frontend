import { expect, test } from "bun:test";
import { shouldKeepPersistentPlayerForRoute } from "../src/lib/persistent-player-navigation";

test("keeps the persistent player when returning to its video", () => {
  expect(
    shouldKeepPersistentPlayerForRoute(
      "https://www.youtube.com/watch?v=abcdefghijk",
      "/watch?v=abcdefghijk&list=playlist",
    ),
  ).toBe(true);
});

test("destroys a persistent player when another watch video is opened", () => {
  expect(
    shouldKeepPersistentPlayerForRoute(
      "https://www.youtube.com/watch?v=abcdefghijk",
      "/watch?v=lmnopqrstuv",
    ),
  ).toBe(false);
});

test("keeps the mini-player on non-watch routes", () => {
  expect(shouldKeepPersistentPlayerForRoute("stream-1", "/search?q=live")).toBe(true);
});
