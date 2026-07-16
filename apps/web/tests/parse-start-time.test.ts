import { expect, test } from "bun:test";
import { parseStartTime } from "../src/lib/parse-start-time";

test("returns 0 for undefined input", () => {
  expect(parseStartTime(undefined)).toBe(0);
});

test("returns 0 for zero", () => {
  expect(parseStartTime(0)).toBe(0);
});

test("returns the number for positive integer", () => {
  expect(parseStartTime(90)).toBe(90);
});

test("parses a numeric string", () => {
  expect(parseStartTime("90")).toBe(90);
});

test("parses hours and minutes", () => {
  expect(parseStartTime("1h30m")).toBe(5400);
});

test("parses hours, minutes, and seconds", () => {
  expect(parseStartTime("1h30m15s")).toBe(5415);
});

test("parses hours only", () => {
  expect(parseStartTime("2h")).toBe(7200);
});

test("returns 0 for garbage input", () => {
  expect(parseStartTime("garbage")).toBe(0);
});

test("returns 0 for empty string", () => {
  expect(parseStartTime("")).toBe(0);
});

test("clamps negative numbers to 0", () => {
  expect(parseStartTime(-5)).toBe(0);
});

test("trims whitespace", () => {
  expect(parseStartTime(" 90 ")).toBe(90);
});

test("returns 0 for null input", () => {
  expect(parseStartTime(null)).toBe(0);
});

test("parses seconds with suffix", () => {
  expect(parseStartTime("90s")).toBe(90);
});

test("parses minutes only", () => {
  expect(parseStartTime("30m")).toBe(1800);
});

test("floors fractional seconds", () => {
  expect(parseStartTime(1.7)).toBe(1);
});

test("floors fractional numeric strings", () => {
  expect(parseStartTime("1.7")).toBe(1);
});

test("returns 0 for NaN", () => {
  expect(parseStartTime(NaN)).toBe(0);
});

test("returns 0 for Infinity", () => {
  expect(parseStartTime(Infinity)).toBe(0);
});

test("parses HMS with spaces between components", () => {
  expect(parseStartTime("1h 30m")).toBe(5400);
});

test("parses HMS with leading and trailing spaces", () => {
  expect(parseStartTime(" 1h 30m 15s ")).toBe(5415);
});

test("handles leading zeros", () => {
  expect(parseStartTime("01h05m")).toBe(3900);
});

test("returns 0 for zero HMS", () => {
  expect(parseStartTime("0h0m0s")).toBe(0);
});

test("handles large hour values", () => {
  expect(parseStartTime("10h")).toBe(36000);
});
