import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { PersistentWatchPlayer } from "../src/components/persistent-watch-player";

test("renders no player or suspense boundary before a video is registered", () => {
  expect(renderToStaticMarkup(<PersistentWatchPlayer />)).toBe("");
});
