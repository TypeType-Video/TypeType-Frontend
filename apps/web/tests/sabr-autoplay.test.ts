import { expect, test } from "bun:test";
import { isAutoplayPolicyError } from "../src/lib/sabr-autoplay";

test("stops automatic playback retries after a browser policy rejection", () => {
  expect(isAutoplayPolicyError(new DOMException("Play is not allowed", "NotAllowedError"))).toBe(
    true,
  );
});

test("allows transient playback failures to be retried", () => {
  expect(isAutoplayPolicyError(new DOMException("Media is not ready", "InvalidStateError"))).toBe(
    false,
  );
});
