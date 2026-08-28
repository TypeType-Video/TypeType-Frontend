import { m } from "../paraglide/messages.js";
import { ApiError } from "./api";

export function familyListBlockedMessage(): string {
  return m.ui_family_list_blocked();
}

export function isChannelNotAllowedError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.status === 403 &&
    error.message.toLowerCase().includes("channel is not allowed")
  );
}
