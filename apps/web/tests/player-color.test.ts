import { expect, test } from "bun:test";
import { isPlayerColor, PLAYER_COLORS, playerColorValue } from "../src/lib/player-color";

test("the default color keeps the built-in player look", () => {
  expect(playerColorValue("default")).toBeNull();
});

test("every other color has a swatch", () => {
  for (const color of PLAYER_COLORS.filter((value) => value !== "default")) {
    expect(playerColorValue(color)).toMatch(/^#[0-9a-f]{6}$/);
  }
});

test("only known colors are accepted from storage", () => {
  expect(isPlayerColor("blue")).toBe(true);
  expect(isPlayerColor("teal")).toBe(false);
  expect(isPlayerColor(undefined)).toBe(false);
});
