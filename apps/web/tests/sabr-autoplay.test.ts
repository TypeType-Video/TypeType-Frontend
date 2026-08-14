import { expect, test } from "bun:test";
import { isAutoplayPolicyError, SabrAutoplayAttempt } from "../src/lib/sabr-autoplay";

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

test("keeps one autoplay attempt while browser playback is pending", () => {
  const attempt = new SabrAutoplayAttempt();

  expect(attempt.begin()).toBe(true);
  expect(attempt.begin()).toBe(false);
  expect(attempt.isConfirmed).toBe(false);
});

test("stops autoplay after a browser policy rejection", () => {
  const attempt = new SabrAutoplayAttempt();
  attempt.begin();

  expect(attempt.reject(new DOMException("Play is not allowed", "NotAllowedError"))).toBe(false);
  expect(attempt.isConfirmed).toBe(true);
  expect(attempt.begin()).toBe(false);
});

test("retries autoplay after a transient playback failure", () => {
  const attempt = new SabrAutoplayAttempt();
  attempt.begin();

  expect(attempt.reject(new DOMException("Media is not ready", "InvalidStateError"))).toBe(true);
  expect(attempt.begin()).toBe(true);
});
