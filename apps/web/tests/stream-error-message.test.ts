import { expect, test } from "bun:test";
import { ApiError } from "../src/lib/api";
import { resolveStreamErrorMessage } from "../src/lib/stream-error-message";

test("explains provider access blocks and suggests a server-side VPN", () => {
  const error = new ApiError(
    "YouTube requested CAPTCHA verification",
    422,
    "provider_access_blocked",
  );

  expect(resolveStreamErrorMessage(error)).toContain("VPN");
  expect(resolveStreamErrorMessage(error)).toContain("TypeType server");
});

test("explains region restrictions without treating every 422 as a VPN issue", () => {
  const region = new ApiError("Only available in Japan", 400, "geographic_restriction");
  const noStream = new ApiError(
    "No compatible stream is available for this video",
    422,
    "no_playable_streams",
  );

  expect(resolveStreamErrorMessage(region)).toContain("region");
  expect(resolveStreamErrorMessage(region)).toContain("VPN");
  expect(resolveStreamErrorMessage(noStream)).not.toContain("VPN");
});

test("maps unknown 422 responses to a retry message", () => {
  const error = new ApiError("internal provider detail", 422, "error");

  expect(resolveStreamErrorMessage(error)).toBe(
    "The video service could not provide a playable stream. Try again later.",
  );
});

test("keeps legacy provider messages actionable before code rollout", () => {
  expect(
    resolveStreamErrorMessage(new ApiError("Your IP is blocked by YouTube", 422, null)),
  ).toContain("VPN");
  expect(
    resolveStreamErrorMessage(
      new ApiError("This video is not available in your country", 400, null),
    ),
  ).toContain("VPN");
});

test("keeps unrelated status errors available to their existing handlers", () => {
  expect(resolveStreamErrorMessage(new ApiError("Bad request", 400, "bad_request"))).toBeNull();
});
