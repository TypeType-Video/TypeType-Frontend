import { expect, test } from "bun:test";
import { getWatchLayoutClasses } from "../src/components/watch-layout-classes";

test("exposes stable watch hooks without changing the player identity", () => {
  const classes = getWatchLayoutClasses(false, false);

  expect(classes.containerClass).toContain("watch-layout-container");
  expect(classes.playerWrapClass).toContain("watch-player-wrap");
  expect(classes.playerBoxClass).toContain("watch-player-box");
  expect(classes.playerClassName).toBe("watch-player-surface");
});

test("keeps cinema sizing alongside the mobile landscape hooks", () => {
  const classes = getWatchLayoutClasses(true, false);

  expect(classes.playerBoxClass).toContain("aspect-video");
  expect(classes.playerClassName).toContain("[--video-aspect-ratio:16/9]");
  expect(classes.playerClassName).toContain("watch-player-surface");
});
