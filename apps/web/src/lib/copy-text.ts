export type CopyTextEnvironment = {
  clipboard: Pick<Clipboard, "writeText"> | null;
  document: Document | null;
};

function getBrowserEnvironment(): CopyTextEnvironment {
  return {
    clipboard: typeof navigator === "undefined" ? null : navigator.clipboard,
    document: typeof document === "undefined" ? null : document,
  };
}

export async function copyText(
  value: string,
  environment: CopyTextEnvironment = getBrowserEnvironment(),
): Promise<boolean> {
  if (environment.clipboard) {
    try {
      await environment.clipboard.writeText(value);
      return true;
    } catch {
      // A non-secure context can expose the API while still rejecting writes.
    }
  }

  const documentRef = environment.document;
  if (!documentRef || typeof documentRef.execCommand !== "function") return false;

  const textarea = documentRef.createElement("textarea");
  textarea.value = value;
  textarea.readOnly = true;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";
  documentRef.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  try {
    return documentRef.execCommand("copy");
  } catch {
    return false;
  } finally {
    textarea.remove();
  }
}
