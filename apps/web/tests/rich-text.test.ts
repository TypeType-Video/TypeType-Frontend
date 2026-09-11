import { describe, expect, test } from "bun:test";
import { parseTextSegments } from "../src/lib/rich-text";

describe("rich text segments", () => {
  test("keeps links, timecodes, and surrounding text interactive", () => {
    expect(parseTextSegments("Watch 1:23 https://example.com/video")).toEqual([
      { id: "t0", type: "text", value: "Watch " },
      { id: "c1", type: "timecode", value: "1:23", seconds: 83 },
      { id: "t2", type: "text", value: " " },
      { id: "u3", type: "url", value: "https://example.com/video" },
    ]);
  });

  test("does not create empty segments", () => {
    expect(parseTextSegments("")).toEqual([]);
    expect(parseTextSegments("1:23")).toEqual([
      { id: "c0", type: "timecode", value: "1:23", seconds: 83 },
    ]);
  });
});
