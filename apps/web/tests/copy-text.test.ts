import { describe, expect, mock, test } from "bun:test";
import { type CopyTextEnvironment, copyText } from "../src/lib/copy-text";

function fallbackEnvironment(copyResult = true) {
  const remove = mock(() => {});
  const textarea = {
    value: "",
    readOnly: false,
    style: {} as CSSStyleDeclaration,
    focus: mock(() => {}),
    select: mock(() => {}),
    remove,
  } as unknown as HTMLTextAreaElement;
  const appendChild = mock(() => textarea);
  const execCommand = mock(() => copyResult);
  const documentRef = {
    body: { appendChild },
    createElement: mock(() => textarea),
    execCommand,
  } as unknown as Document;

  return { documentRef, textarea, appendChild, execCommand, remove };
}

describe("copyText", () => {
  test("uses the Clipboard API when it is available", async () => {
    const writeText = mock(async () => {});
    const environment: CopyTextEnvironment = {
      clipboard: { writeText },
      document: null,
    };

    expect(await copyText("reset-token", environment)).toBe(true);
    expect(writeText).toHaveBeenCalledWith("reset-token");
  });

  test("falls back when the Clipboard API is unavailable", async () => {
    const fallback = fallbackEnvironment();

    expect(
      await copyText("reset-token", {
        clipboard: null,
        document: fallback.documentRef,
      }),
    ).toBe(true);
    expect(fallback.textarea.value).toBe("reset-token");
    expect(fallback.appendChild).toHaveBeenCalledTimes(1);
    expect(fallback.execCommand).toHaveBeenCalledWith("copy");
    expect(fallback.remove).toHaveBeenCalledTimes(1);
  });

  test("falls back after a Clipboard API rejection", async () => {
    const fallback = fallbackEnvironment();
    const writeText = mock(async () => {
      throw new Error("clipboard denied");
    });

    expect(
      await copyText("reset-token", {
        clipboard: { writeText },
        document: fallback.documentRef,
      }),
    ).toBe(true);
    expect(fallback.execCommand).toHaveBeenCalledWith("copy");
  });

  test("reports failure when no copy mechanism is available", async () => {
    expect(await copyText("reset-token", { clipboard: null, document: null })).toBe(false);
  });
});
