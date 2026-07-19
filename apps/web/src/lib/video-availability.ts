import { isMemberOnlyMessage, MEMBER_ONLY_MESSAGE } from "./member-only";

export type VideoAvailability = "scheduled_premiere" | "paid_content" | "members_only";

type AvailabilityCopy = {
  heading: string;
  message: string;
};

export function resolveVideoAvailability(error: unknown): VideoAvailability | null {
  if (!(error instanceof Error)) return null;
  if ("code" in error && typeof error.code === "string" && isAvailabilityCode(error.code)) {
    return error.code;
  }

  const message = error.message.toLowerCase();
  if (message.includes("premieres in") || message.includes("premiere has not started")) {
    return "scheduled_premiere";
  }
  if (isMemberOnlyMessage(message)) return "members_only";
  if (
    message.includes("paid video") ||
    message.includes("payment required") ||
    message.includes("youtube music premium")
  ) {
    return "paid_content";
  }
  return null;
}

export function videoAvailabilityCopy(
  availability: VideoAvailability,
  sourceMessage?: string,
): AvailabilityCopy {
  if (availability === "scheduled_premiere") {
    return {
      heading: "Premiere scheduled",
      message: premiereMessage(sourceMessage),
    };
  }
  if (availability === "paid_content") {
    return {
      heading: "Paid video",
      message: "This video must be purchased on YouTube before it can be played.",
    };
  }
  return {
    heading: "Members-only video",
    message: MEMBER_ONLY_MESSAGE,
  };
}

function isAvailabilityCode(code: string | null): code is VideoAvailability {
  return code === "scheduled_premiere" || code === "paid_content" || code === "members_only";
}

function premiereMessage(sourceMessage?: string): string {
  const relativeTime = sourceMessage?.match(/premieres?\s+in\s+(.+?)[.!]?$/i)?.[1]?.trim();
  return relativeTime
    ? `This premiere starts in ${relativeTime}.`
    : "This premiere has not started yet.";
}
