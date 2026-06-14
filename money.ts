import { describe, expect, it } from "vitest";
import { formatPhp, parsePhp } from "./money.js";

describe("money", () => {
  it("parses PHP as integer centavos", () => {
    expect(parsePhp("500")).toBe(50_000);
    expect(parsePhp("49.99")).toBe(4_999);
  });

  it("rejects malformed amounts", () => {
    expect(() => parsePhp("-1")).toThrow();
    expect(() => parsePhp("1.999")).toThrow();
    expect(() => parsePhp("abc")).toThrow();
  });

  it("formats centavos", () => {
    expect(formatPhp(49_900)).toContain("499.00");
  });
});
