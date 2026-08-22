import { describe, expect, test } from "bun:test";
import type { ReactElement } from "react";
import { PortabilityFormatIcon } from "../src/components/portability-format-icon";

function imageSource(format: string): string | undefined {
  const element = PortabilityFormatIcon({ format }) as ReactElement<{ src?: string }>;
  return element.props.src;
}

describe("portability format icons", () => {
  test("uses the official source assets for unsupported Simple Icons brands", () => {
    expect(imageSource("flow")).toBe("/portability-formats/flow.png");
    expect(imageSource("grayjay")).toBe("/portability-formats/grayjay.png");
    expect(imageSource("materialious")).toBe("/portability-formats/materialious.png");
    expect(imageSource("skytube")).toBe("/portability-formats/skytube.png");
    expect(imageSource("viewtube")).toBe("/portability-formats/viewtube.png");
    expect(imageSource("youtube-local")).toBe("/portability-formats/youtube-local.ico");
  });
});
