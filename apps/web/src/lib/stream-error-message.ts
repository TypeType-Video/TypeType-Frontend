import { m } from "../paraglide/messages.js";
import { ApiError } from "./api";

export function resolveStreamErrorMessage(error: unknown): string | null {
  if (!(error instanceof ApiError)) return null;

  switch (error.code) {
    case "provider_access_blocked":
      return m.ui_error_provider_blocked();
    case "geographic_restriction":
      return m.ui_error_region_restricted();
    case "no_playable_streams":
      return m.ui_error_no_playable_stream();
    case "private_content":
      return m.ui_error_private_video();
    case "age_restricted":
      return m.ui_error_age_restricted();
  }

  const message = error.message.toLowerCase();
  if (isProviderAccessBlockedMessage(message)) return m.ui_error_provider_blocked();
  if (isRegionRestrictedMessage(message)) return m.ui_error_region_restricted();
  if (error.status === 422) return m.ui_error_stream_unavailable();
  return null;
}

function isProviderAccessBlockedMessage(message: string): boolean {
  return (
    message.includes("ip is blocked") ||
    message.includes("captcha") ||
    message.includes("recaptcha") ||
    message.includes("not a bot") ||
    message.includes("bot check") ||
    message.includes("anti-bot")
  );
}

function isRegionRestrictedMessage(message: string): boolean {
  return (
    message.includes("not available in your country") ||
    message.includes("not available in your region") ||
    message.includes("only available in") ||
    message.includes("same region") ||
    message.includes("geographic restriction")
  );
}
