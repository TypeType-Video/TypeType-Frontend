import { expect, test } from "bun:test";
import type { CodecFamily } from "../src/lib/quality-utils";
import {
  maxSabrCodecLabel,
  sabrCodecOptions,
  sabrResolutionOptions,
  selectSabrCodec,
} from "../src/lib/sabr-quality-selection";
import type { SabrQualityOption } from "../src/stores/sabr-quality-store";

function option(itag: number, height: number, codec: CodecFamily): SabrQualityOption {
  return {
    itag,
    label: `${height}p`,
    height,
    codec,
    codecValue: codec === "H.264" ? "avc1.64001f" : codec.toLowerCase(),
    mimeType: codec === "VP9" ? "video/webm" : "video/mp4",
    width: Math.round((height * 16) / 9),
    fps: 30,
    bitrate: 1_000_000,
  };
}

const options = [
  option(137, 1080, "H.264"),
  option(136, 720, "H.264"),
  option(248, 1080, "VP9"),
  option(247, 720, "VP9"),
  option(243, 360, "VP9"),
  option(399, 1080, "AV1"),
  option(398, 720, "AV1"),
];

test("keeps selected codec while listing sabr resolutions", () => {
  const selected = options.find((item) => item.itag === 247);
  if (!selected) throw new Error("Missing selected option");

  expect(sabrResolutionOptions(options, selected).map((item) => item.itag)).toEqual([
    248, 247, 243,
  ]);
});

test("switches sabr codec at the current resolution", () => {
  const selected = options.find((item) => item.itag === 247);
  if (!selected) throw new Error("Missing selected option");

  expect(selectSabrCodec(options, selected, "AV1")?.itag).toBe(398);
  expect(sabrCodecOptions(options)).toEqual(["H.264", "VP9", "AV1"]);
  expect(maxSabrCodecLabel(options, "H.264")).toBe("1080p");
});

test("falls back to the nearest lower resolution for a codec", () => {
  const selected = option(401, 2160, "AV1");

  expect(selectSabrCodec(options, selected, "H.264")?.itag).toBe(137);
});

test("groups portrait streams by their canonical quality tier", () => {
  const portrait = [
    { ...option(399, 1920, "AV1"), label: "1080p", width: 1080 },
    { ...option(398, 1280, "AV1"), label: "720p", width: 720 },
    { ...option(397, 854, "AV1"), label: "480p", width: 480 },
    { ...option(396, 480, "AV1"), label: "480p", width: 270 },
  ];

  expect(sabrResolutionOptions(portrait, portrait[0]).map((item) => item.label)).toEqual([
    "1080p",
    "720p",
    "480p",
  ]);
  expect(maxSabrCodecLabel(portrait, "AV1")).toBe("1080p");
});
