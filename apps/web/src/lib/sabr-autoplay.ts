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

  resolve(): void {
    this.pending = false;
    this.confirmed = true;
  }

  reject(error: unknown): boolean {
    this.pending = false;
    if (!isAutoplayPolicyError(error)) return true;
    this.confirmed = true;
    return false;
  }

  reset(): void {
    this.confirmed = false;
    this.pending = false;
  }
}
