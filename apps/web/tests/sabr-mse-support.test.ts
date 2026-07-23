import { expect, test } from "bun:test";
import { isSabrVideoSupported } from "../src/lib/sabr-source";
import type { VideoStreamItem } from "../src/types/api";

const video = {
  codec: "avc1.640028",
  mimeType: "video/mp4",
} as VideoStreamItem;

test("accepts a SABR codec supported by the active MSE runtime", () => {
  expect(isSabrVideoSupported(video, (mime) => mime.includes("avc1.640028"))).toBe(true);
});

test("rejects a SABR codec unsupported by the active MSE runtime", () => {
  expect(isSabrVideoSupported(video, () => false)).toBe(false);
});

test("rejects unknown codec families before probing MSE", () => {
  let probes = 0;
  const unknown = { ...video, codec: "unknown" };

  expect(
    isSabrVideoSupported(unknown, () => {
      probes += 1;
      return true;
    }),
  ).toBe(false);
  expect(probes).toBe(0);
});
