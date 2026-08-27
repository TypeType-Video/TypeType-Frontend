const USERNAME_REGEX = /^[a-zA-Z0-9._-]+$/;

export type ProfileValidationErrorCode =
  | "USERNAME_TOO_SHORT"
  | "USERNAME_TOO_LONG"
  | "USERNAME_INVALID_FORMAT"
  | "BIO_TOO_LONG";

export function normalizeField(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

export function validatePublicUsername(value: string | null): ProfileValidationErrorCode | null {
  if (value === null) return null;
  if (value.length < 3) return "USERNAME_TOO_SHORT";
  if (value.length > 32) return "USERNAME_TOO_LONG";
  if (!USERNAME_REGEX.test(value)) return "USERNAME_INVALID_FORMAT";
  return null;
}

export function validateBio(value: string | null): ProfileValidationErrorCode | null {
  if (value === null) return null;
  if (value.length > 280) return "BIO_TOO_LONG";
  return null;
}
