export const MEMBER_ONLY_MESSAGE = "This video is only available for members";

export function isMemberOnlyMessage(message: string | null | undefined): boolean {
  if (!message) return false;
  const value = message.toLowerCase();
  return (
    value.includes("only available for members") ||
    value.includes("members-only") ||
    value.includes("member only") ||
    value.includes("requires membership") ||
    value.includes("premium content")
  );
}

export function isMemberOnlyApiError(error: unknown): boolean {
  if (!(error instanceof Error) || !("status" in error)) return false;
  if ("code" in error && error.code === "members_only") return true;
  return (error.status === 400 || error.status === 422) && isMemberOnlyMessage(error.message);
}
