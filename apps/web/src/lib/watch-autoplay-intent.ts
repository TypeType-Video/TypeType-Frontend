let pending = false;

export function markWatchAutoplayIntent(): void {
  pending = true;
}

export function consumeWatchAutoplayIntent(): boolean {
  if (!pending) return false;
  pending = false;
  return true;
}
