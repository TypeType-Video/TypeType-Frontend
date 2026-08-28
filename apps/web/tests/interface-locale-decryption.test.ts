import { describe, expect, test } from "bun:test";
import { centeredRevealOrder, decryptedIteration } from "../src/lib/interface-locale-decryption";

describe("interface locale decryption", () => {
  test("reveals non-space characters from the center", () => {
    expect(centeredRevealOrder("ABCDE")).toEqual([2, 1, 3, 0, 4]);
    expect(centeredRevealOrder("AB CD")).toEqual([1, 3, 0, 4]);
  });

  test("keeps spaces stable while text is encrypted", () => {
    const text = "Hello world";
    const encrypted = decryptedIteration(text, centeredRevealOrder(text), 1);
    expect(encrypted).toHaveLength(text.length);
    expect(encrypted[5]).toBe(" ");
  });

  test("keeps punctuation stable while text is encrypted", () => {
    const text = "Hello, world!";
    const encrypted = decryptedIteration(text, centeredRevealOrder(text), 1);
    expect(encrypted[5]).toBe(",");
    expect(encrypted[12]).toBe("!");
  });

  test("restores the exact translated text on the final iteration", () => {
    const text = "Préférer la langue originale";
    expect(decryptedIteration(text, centeredRevealOrder(text), 18)).toBe(text);
  });
});
