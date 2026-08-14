import { expect, test } from "bun:test";
import {
  guardAutoplay,
  isAutoplayPolicyError,
  SabrAutoplayAttempt,
  SabrAutoplayDeadline,
} from "../src/lib/sabr-autoplay";

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

test("expires a browser playback attempt that remains pending", () => {
  const attempt = new SabrAutoplayAttempt();
  attempt.begin();

  expect(attempt.expire()).toBe(true);
  expect(attempt.isConfirmed).toBe(true);
  expect(attempt.resolve()).toBe(false);
  expect(attempt.begin()).toBe(false);
  expect(attempt.expire()).toBe(false);
});

test("accepts playback that resolves before the deadline", () => {
  const attempt = new SabrAutoplayAttempt();
  attempt.begin();

  expect(attempt.resolve()).toBe(true);
  expect(attempt.isConfirmed).toBe(true);
});

test("pauses a late playback event until user playback is allowed", () => {
  let listener = () => {};
  let pauses = 0;
  const target = {
    addEventListener: (_type: "play", next: () => void) => {
      listener = next;
    },
    removeEventListener: (_type: "play", next: () => void) => {
      if (listener === next) listener = () => {};
    },
    closest: () => null,
  };
  const attempt = new SabrAutoplayAttempt();
  attempt.begin();
  attempt.expire();
  const unguard = guardAutoplay(target as unknown as HTMLVideoElement, attempt, () => {
    pauses += 1;
  });

  listener();
  attempt.allow();
  listener();
  unguard();
  listener();

  expect(pauses).toBe(1);
});

test("cancels an armed autoplay deadline", async () => {
  let expirations = 0;
  const deadline = new SabrAutoplayDeadline(() => {
    expirations += 1;
  }, 5);

  deadline.arm();
  deadline.clear();
  await Bun.sleep(10);

  expect(expirations).toBe(0);
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
