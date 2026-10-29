export function setTestOrigin(origin: string): void {
  Object.defineProperty(globalThis.window, "location", {
    configurable: true,
    writable: true,
    value: { origin },
  });
}
