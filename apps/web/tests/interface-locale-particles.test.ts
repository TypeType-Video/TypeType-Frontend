import { describe, expect, test } from "bun:test";
import {
  localeParticleBudget,
  localeParticleOffset,
  sampleOpaquePixels,
} from "../src/lib/interface-locale-particles";

describe("interface locale particles", () => {
  test("keeps the particle budget bounded across viewports", () => {
    expect(localeParticleBudget(390, 844)).toBe(365);
    expect(localeParticleBudget(1920, 1080)).toBe(1200);
    expect(localeParticleBudget(10_000, 10_000)).toBe(1200);
  });

  test("uses deterministic offsets within the requested scatter radius", () => {
    const first = localeParticleOffset(42, 32);
    const second = localeParticleOffset(42, 32);
    expect(second).toEqual(first);
    expect(Math.hypot(first[0], first[1] + 32 * 0.12)).toBeLessThanOrEqual(32);
  });

  test("samples only opaque glyph pixels", () => {
    const data = new Uint8ClampedArray([
      255, 255, 255, 0, 10, 20, 30, 255, 40, 50, 60, 47, 70, 80, 90, 128,
    ]);
    expect(sampleOpaquePixels(data, 2, 2, 1)).toEqual([
      { x: 1, y: 0, color: "rgb(10, 20, 30)", alpha: 1 },
      { x: 1, y: 1, color: "rgb(70, 80, 90)", alpha: 128 / 255 },
    ]);
  });
});
