import { expect, test } from "bun:test";
import { ApiError } from "../src/lib/api";
import { sanitizeRedirect } from "../src/lib/auth-routes";
import {
  deviceLinkPath,
  formatDeviceCodeInput,
  normalizeDeviceCode,
  spellDeviceCode,
} from "../src/lib/device-link-code";
import { deviceLinkProblem } from "../src/lib/device-link-errors";

test("typed codes are normalized like the server expects", () => {
  expect(normalizeDeviceCode("kq4m 7tzd")).toBe("KQ4M-7TZD");
  expect(normalizeDeviceCode("KQ4M-7TZD")).toBe("KQ4M-7TZD");
});

test("codes with ambiguous or missing characters are refused before any request", () => {
  expect(normalizeDeviceCode("KQ4M-7TZ0")).toBeNull();
  expect(normalizeDeviceCode("AEIO-UKQ4")).toBeNull();
  expect(normalizeDeviceCode("KQ4M")).toBeNull();
});

test("the input groups the code in two halves as it is typed", () => {
  expect(formatDeviceCodeInput("kq4")).toBe("KQ4");
  expect(formatDeviceCodeInput("kq4m7t")).toBe("KQ4M-7T");
  expect(formatDeviceCodeInput("kq4m-7tzd-extra")).toBe("KQ4M-7TZD");
});

test("signing in returns to the confirmation of the same code", () => {
  expect(sanitizeRedirect(deviceLinkPath("KQ4M-7TZD"))).toBe("/link?code=KQ4M-7TZD");
});

test("link redirects cannot carry anything else", () => {
  expect(sanitizeRedirect("/link?code=KQ4M-7TZD&next=//evil.example")).toBe("/");
  expect(sanitizeRedirect("/link?code=<script>")).toBe("/");
});

test("server error codes map to the right message", () => {
  const problem = (code: string, status: number) =>
    deviceLinkProblem(new ApiError(code, status, code));
  expect(problem("code_not_found", 404)).toBe("not_found");
  expect(problem("too_many_attempts", 429)).toBe("locked");
  expect(problem("device_login_disabled", 403)).toBe("disabled");
  expect(problem("already_decided", 409)).toBe("already_used");
  expect(deviceLinkProblem(new Error("offline"))).toBe("failed");
});

test("screen readers spell the code one character at a time", () => {
  expect(spellDeviceCode("KQ4M-7TZD")).toBe("K Q 4 M 7 T Z D");
});
