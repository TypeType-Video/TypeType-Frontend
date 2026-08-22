import { describe, expect, test } from "bun:test";
import { portabilityImportGuide } from "../src/lib/portability-import-guides";

describe("portability import guides", () => {
  test("guides self-hosters through a YouTube Takeout export", () => {
    const guide = portabilityImportGuide("youtube-takeout");

    expect(guide.action?.url).toContain("takeout.google.com");
    expect(guide.steps.join(" ")).toContain("original ZIP");
    expect(guide.steps.join(" ")).toContain("one at a time");
  });

  test("provides a safe generic path for every other project", () => {
    const guide = portabilityImportGuide("newpipe");

    expect(guide.description).toContain("NewPipe");
    expect(guide.steps.join(" ")).toContain("without editing or extracting");
    expect(guide.steps.join(" ")).toContain("preview");
  });
});
