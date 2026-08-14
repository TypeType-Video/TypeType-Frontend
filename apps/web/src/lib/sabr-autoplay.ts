export function isAutoplayPolicyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    error.name === "NotAllowedError"
  );
}

export class SabrAutoplayAttempt {
  private confirmed = false;
  private expired = false;
  private pending = false;

  get isConfirmed(): boolean {
    return this.confirmed;
  }

  get isExpired(): boolean {
    return this.expired;
  }

  begin(): boolean {
    if (this.confirmed || this.pending) return false;
    this.pending = true;
    return true;
  }

  resolve(): boolean {
    this.pending = false;
    if (this.confirmed) return false;
    this.confirmed = true;
    return true;
  }

  expire(): boolean {
    if (this.confirmed || !this.pending) return false;
    this.pending = false;
    this.confirmed = true;
    this.expired = true;
    return true;
  }

  allow(): void {
    this.expired = false;
  }

  reject(error: unknown): boolean {
    this.pending = false;
    if (this.confirmed) return false;
    if (!isAutoplayPolicyError(error)) return true;
    this.confirmed = true;
    return false;
  }

  reset(): void {
    this.confirmed = false;
    this.expired = false;
    this.pending = false;
  }
}

type AutoplayEventTarget = {
  addEventListener: (type: "play", listener: () => void) => void;
  removeEventListener: (type: "play", listener: () => void) => void;
};

export function guardAutoplay(
  target: AutoplayEventTarget,
  attempt: SabrAutoplayAttempt,
  pause: () => void,
): () => void {
  const stopExpiredPlayback = () => {
    if (attempt.isExpired) pause();
  };
  target.addEventListener("play", stopExpiredPlayback);
  return () => target.removeEventListener("play", stopExpiredPlayback);
}

export class SabrAutoplayDeadline {
  private timer: ReturnType<typeof globalThis.setTimeout> | undefined;
  private readonly onExpire: () => void;
  private readonly timeoutMs: number;

  constructor(onExpire: () => void, timeoutMs = 250) {
    this.onExpire = onExpire;
    this.timeoutMs = timeoutMs;
  }

  arm(): void {
    this.clear();
    this.timer = globalThis.setTimeout(() => {
      this.timer = undefined;
      this.onExpire();
    }, this.timeoutMs);
  }

  clear(): void {
    if (this.timer === undefined) return;
    globalThis.clearTimeout(this.timer);
    this.timer = undefined;
  }
}
