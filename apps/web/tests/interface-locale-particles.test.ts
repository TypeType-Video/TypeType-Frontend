import { describe, expect, test } from "bun:test";
import { localeParticleBudget, localeParticleOffset } from "../src/lib/interface-locale-particles";

describe("interface locale particles", () => {
  test("keeps the particle budget bounded across viewports", () => {
    expect(localeParticleBudget(390, 844)).toBe(102);
    expect(localeParticleBudget(1920, 1080)).toBe(360);
    expect(localeParticleBudget(10_000, 10_000)).toBe(360);
  });

  test("uses deterministic offsets within the requested scatter radius", () => {
    const first = localeParticleOffset(42, 32);
    const second = localeParticleOffset(42, 32);
    expect(second).toEqual(first);
    expect(Math.hypot(first[0], first[1] + 32 * 0.12)).toBeLessThanOrEqual(32);
  });
});
