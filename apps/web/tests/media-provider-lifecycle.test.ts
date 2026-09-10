import { describe, expect, mock, test } from "bun:test";
import { MediaProviderLifecycle } from "../src/lib/media-provider-lifecycle";

const provider = () => ({ destroy: mock(() => undefined) });

describe("MediaProviderLifecycle", () => {
  test("destroys the previous provider before replacing it", () => {
    const lifecycle = new MediaProviderLifecycle();
    const first = provider();
    const second = provider();

    lifecycle.replace(first);
    lifecycle.replace(second);

    expect(first.destroy).toHaveBeenCalledTimes(1);
    expect(second.destroy).not.toHaveBeenCalled();
  });

  test("destroys the active provider once on disposal", () => {
    const lifecycle = new MediaProviderLifecycle();
    const active = provider();

    lifecycle.replace(active);
    lifecycle.replace(active);
    lifecycle.dispose();
    lifecycle.dispose();

    expect(active.destroy).toHaveBeenCalledTimes(1);
  });
});
