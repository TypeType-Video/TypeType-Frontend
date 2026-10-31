const store = new Map<string, string>();

const mockStorage = {
  get length() {
    return store.size;
  },
  key: (index: number) => Array.from(store.keys())[index] ?? null,
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => {
    store.set(key, String(value));
  },
  removeItem: (key: string) => {
    store.delete(key);
  },
  clear: () => {
    store.clear();
  },
};

if (!("localStorage" in globalThis) || !globalThis.localStorage) {
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: mockStorage });
} else {
  // Another test file may have installed a bare stub first; copying descriptors keeps `length` a live getter,
  // which Object.assign would freeze at its current value.
  Object.defineProperties(globalThis.localStorage, Object.getOwnPropertyDescriptors(mockStorage));
}

if (typeof (globalThis as { window?: unknown }).window === "undefined") {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    writable: true,
    value: globalThis,
  });
}
