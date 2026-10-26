import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";

const mobileStyles = readFileSync(
  new URL("../src/styles/watch-mobile-landscape.css", import.meta.url),
  "utf8",
);

test("contains portrait video content in the floating player", () => {
  expect(mobileStyles).toMatch(
    /\.typetype-persistent-player-frame\[data-floating\]\s+video\s*\{\s*object-fit:\s*contain;\s*\}/,
  );
});
