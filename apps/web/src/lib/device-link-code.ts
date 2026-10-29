const USER_CODE_ALPHABET = "BCDFGHJKLMNPQRSTVWXZ23456789";
const USER_CODE_LENGTH = 8;

export function normalizeDeviceCode(input: string): string | null {
  const compact = input.toUpperCase().replace(/[\s-]/g, "");
  if (compact.length !== USER_CODE_LENGTH) return null;
  for (const char of compact) if (!USER_CODE_ALPHABET.includes(char)) return null;
  return `${compact.slice(0, 4)}-${compact.slice(4)}`;
}

export function formatDeviceCodeInput(input: string): string {
  const compact = input
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, USER_CODE_LENGTH);
  return compact.length > 4 ? `${compact.slice(0, 4)}-${compact.slice(4)}` : compact;
}

export function deviceLinkPath(code: string): `/link?code=${string}` {
  return `/link?code=${encodeURIComponent(code)}`;
}

export function spellDeviceCode(code: string): string {
  return [...code.replace("-", "")].join(" ");
}
