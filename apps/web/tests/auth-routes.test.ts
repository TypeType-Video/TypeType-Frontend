import { describe, expect, test } from "bun:test";
import { isAuthPage, shouldEnforceBootstrapRegistration } from "../src/lib/auth-routes";

describe("authentication routes", () => {
  test("keeps the OIDC callback active during administrator bootstrap", () => {
    expect(isAuthPage("/auth/oidc/callback")).toBe(true);
    expect(shouldEnforceBootstrapRegistration("/auth/oidc/callback")).toBe(false);
  });

  test("does not exempt other authentication pages from bootstrap", () => {
    expect(shouldEnforceBootstrapRegistration("/register")).toBe(true);
    expect(shouldEnforceBootstrapRegistration("/login")).toBe(true);
  });
});
