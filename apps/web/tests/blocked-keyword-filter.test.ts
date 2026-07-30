import { describe, expect, test } from "bun:test";
import {
  normalizeBlockedKeyword,
  titleMatchesBlockedKeyword,
} from "../src/lib/blocked-keyword-filter";

describe("blocked keyword filtering", () => {
  test("normalizes whitespace, case, and compatible Unicode forms", () => {
    expect(normalizeBlockedKeyword("  Ｇａｍｅ  ")).toBe("game");
  });

  test("matches keywords anywhere in a title without case sensitivity", () => {
    expect(titleMatchesBlockedKeyword("A Long SPONSORED Review", ["sponsored"])).toBe(true);
  });

  test("ignores empty keywords", () => {
    expect(titleMatchesBlockedKeyword("Any video", ["", "   "])).toBe(false);
  });
});
