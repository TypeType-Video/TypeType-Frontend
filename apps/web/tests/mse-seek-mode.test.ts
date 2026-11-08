import "./setup";
import { beforeEach, expect, test } from "bun:test";
import {
  getEffectiveMseSeekMode,
  getMseSeekModePreference,
  setMseSeekModePreference,
} from "../src/lib/mse-seek-mode";

beforeEach(() => {
  localStorage.clear();
});

test("returns default when no preference is saved in localStorage", () => {
  expect(getMseSeekModePreference()).toBe("default");
  expect(getEffectiveMseSeekMode()).toBe("preroll");
});

test("persists native and preroll preferences in localStorage", () => {
  setMseSeekModePreference("native");
  expect(getMseSeekModePreference()).toBe("native");
  expect(getEffectiveMseSeekMode()).toBe("native");

  setMseSeekModePreference("preroll");
  expect(getMseSeekModePreference()).toBe("preroll");
  expect(getEffectiveMseSeekMode()).toBe("preroll");

  setMseSeekModePreference("default");
  expect(getMseSeekModePreference()).toBe("default");
  expect(getEffectiveMseSeekMode()).toBe("preroll");
});
