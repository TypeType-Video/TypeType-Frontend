import { expect, test } from "bun:test";
import { sponsorBlockBarPosition } from "../src/lib/sponsorblock-bar-layout";

test("aligns the sponsor block bar with the visible slider track", () => {
  expect(
    sponsorBlockBarPosition(
      { top: 100, left: 20, width: 640, height: 360 },
      { top: 420, left: 35, width: 610, height: 5 },
      3,
    ),
  ).toEqual({ top: 321, left: 15, width: 610 });
});
