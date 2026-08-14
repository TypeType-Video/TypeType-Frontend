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
  private pending = false;

  get isConfirmed(): boolean {
    return this.confirmed;
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
    return true;
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
    this.pending = false;
  }
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
