import { expect, test } from "bun:test";
import { resolveVideoAvailability, videoAvailabilityCopy } from "../src/lib/video-availability";

class CodedError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
  }
}

test("uses structured availability codes from the server", () => {
  expect(
    resolveVideoAvailability(new CodedError("Premieres in 200 days", "scheduled_premiere")),
  ).toBe("scheduled_premiere");
  expect(
    resolveVideoAvailability(new CodedError("This video is a paid video", "paid_content")),
  ).toBe("paid_content");
  expect(
    resolveVideoAvailability(
      new CodedError("This video is only available for members", "members_only"),
    ),
  ).toBe("members_only");
});

test("recognizes availability messages from older servers", () => {
  expect(resolveVideoAvailability(new Error("Premieres in 200 days"))).toBe("scheduled_premiere");
  expect(resolveVideoAvailability(new Error("This video is a paid video"))).toBe("paid_content");
  expect(resolveVideoAvailability(new Error("This video is members-only"))).toBe("members_only");
});

test("formats the premiere countdown for the error screen", () => {
  expect(videoAvailabilityCopy("scheduled_premiere", "Premieres in 200 days")).toEqual({
    heading: "Premiere scheduled",
    message: "This premiere starts in 200 days.",
  });
});

test("uses explicit labels for paid and members-only videos", () => {
  expect(videoAvailabilityCopy("paid_content").heading).toBe("Paid video");
  expect(videoAvailabilityCopy("members_only").heading).toBe("Members-only video");
});
