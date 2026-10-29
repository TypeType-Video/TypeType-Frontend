import { expect, test } from "bun:test";
import { bilibiliVerification } from "../src/lib/bilibili-verification";

test("maps Bilibili verification types to badge kinds", () => {
  expect(bilibiliVerification(0)).toBe("personal");
  expect(bilibiliVerification(1)).toBe("organization");
});

test("treats unverified markers as no verification", () => {
  expect(bilibiliVerification(-1)).toBeNull();
  expect(bilibiliVerification(127)).toBeNull();
  expect(bilibiliVerification(undefined)).toBeNull();
});
