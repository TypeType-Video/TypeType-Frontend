import { expect, test } from "bun:test";
import { detectProvider, supportsBulletComments } from "../src/lib/provider";

test("detects BiliBili links as supporting bullet comments", () => {
  expect(detectProvider("https://www.bilibili.com/video/BV1x9YW6FEuU")).toBe("bilibili");
  expect(supportsBulletComments("https://www.bilibili.com/video/BV1x9YW6FEuU")).toBe(true);
});

test("keeps bullet comments disabled for providers without an extractor", () => {
  expect(supportsBulletComments("https://www.youtube.com/watch?v=test")).toBe(false);
  expect(supportsBulletComments("https://example.com/video")).toBe(false);
});
