export function isPlayerOutsideViewport(bottom: number, wasOutside: boolean): boolean {
  return bottom <= 56 + (wasOutside ? 56 : 0);
}
