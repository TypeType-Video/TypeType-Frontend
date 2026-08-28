import { describe, expect, test } from "bun:test";
import {
  estimateTransferRate,
  formatEta,
  formatTransferBytes,
} from "../src/lib/downloader-transfer-display";

describe("downloader transfer display", () => {
  test("formats binary byte units", () => {
    expect(formatTransferBytes(0)).toBe("0 B");
    expect(formatTransferBytes(10 * 1024 * 1024)).toBe("10.0 MiB");
  });

  test("derives rate from remaining bytes and ETA", () => {
    expect(estimateTransferRate(20, 100, 4)).toBe(20);
    expect(estimateTransferRate(100, 100, 0)).toBeNull();
  });

  test("formats short and long ETAs", () => {
    expect(formatEta(12.2)).toBe("13s left");
    expect(formatEta(3721)).toBe("1h 2m left");
  });
});
