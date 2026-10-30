import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";

const mobileStyles = readFileSync(
  new URL("../src/styles/watch-mobile-landscape.css", import.meta.url),
  "utf8",
);

test("contains portrait video content in the floating player", () => {
  expect(mobileStyles).toMatch(
    /\.typetype-persistent-player-frame\[data-floating\]\s+video\s*\{\s*width:\s*100%;\s*height:\s*100%;\s*aspect-ratio:\s*auto;\s*object-fit:\s*contain;\s*\}/,
  );
});

test("stops the player taking the portrait height of the video in the floating frame", () => {
  expect(mobileStyles).toMatch(
    /\[data-floating\]\s+\[data-media-provider\]\s*\{\s*height:\s*100%;\s*aspect-ratio:\s*auto;\s*\}/,
  );
});
