import { m } from "../paraglide/messages.js";
import { ApiError } from "./api";
import type { ProfileValidationErrorCode } from "./profile-validation";

export type ProfileErrorCode =
  | ProfileValidationErrorCode
  | "USERNAME_TAKEN"
  | "USERNAME_INVALID_LENGTH"
  | "PROFILE_UPDATE_FAILED";

const PROFILE_ERROR_MESSAGES: Record<ProfileErrorCode, () => string> = {
  USERNAME_TAKEN: () => m.profile_username_taken(),
  USERNAME_INVALID_FORMAT: () => m.profile_username_invalid_format(),
  USERNAME_INVALID_LENGTH: () => m.profile_username_invalid_length(),
  USERNAME_TOO_SHORT: () => m.profile_username_too_short(),
  USERNAME_TOO_LONG: () => m.profile_username_too_long(),
  BIO_TOO_LONG: () => m.profile_bio_too_long(),
  PROFILE_UPDATE_FAILED: () => m.profile_update_failed(),
};

type ProfileField = "publicUsername" | "bio";

type ProfileServerError = {
  code: ProfileErrorCode;
  field: ProfileField | null;
};

const FIELD_BY_CODE: Record<string, ProfileField | null> = {
  USERNAME_TAKEN: "publicUsername",
  USERNAME_INVALID_FORMAT: "publicUsername",
  USERNAME_INVALID_LENGTH: "publicUsername",
  BIO_TOO_LONG: "bio",
  PROFILE_UPDATE_FAILED: null,
};

export function parseProfileServerError(error: unknown): ProfileServerError {
  if (error instanceof ApiError) {
    const code = isProfileErrorCode(error.message) ? error.message : "PROFILE_UPDATE_FAILED";
    return {
      code,
      field: FIELD_BY_CODE[code] ?? null,
    };
  }
  return {
    code: "PROFILE_UPDATE_FAILED",
    field: null,
  };
}

export function profileErrorMessage(code: ProfileErrorCode): string {
  return PROFILE_ERROR_MESSAGES[code]();
}

function isProfileErrorCode(value: string): value is ProfileErrorCode {
  return value in PROFILE_ERROR_MESSAGES;
}
