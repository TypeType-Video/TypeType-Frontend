import { ApiError } from "./api";

export type DeviceLinkProblem = "not_found" | "locked" | "disabled" | "already_used" | "failed";

export function deviceLinkProblem(error: unknown): DeviceLinkProblem {
  if (!(error instanceof ApiError)) return "failed";
  switch (error.code) {
    case "code_not_found":
      return "not_found";
    case "too_many_attempts":
      return "locked";
    case "device_login_disabled":
      return "disabled";
    case "already_decided":
      return "already_used";
    default:
      return "failed";
  }
}
