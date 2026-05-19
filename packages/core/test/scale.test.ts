import { describe, expect, it } from "vitest";
import { createBandScale } from "../src/scale/band";
import { createLinearScale } from "../src/scale/linear";

describe("createLinearScale", () => {
  it("maps and inverts values", () => {
    const scale = createLinearScale({ domain: [0, 100], range: [0, 10] });

    expect(scale.map(50)).toBe(5);
    expect(scale.invert(5)).toBe(50);
  });

  it("expands equal domains", () => {
    const scale = createLinearScale({ domain: [5, 5], range: [0, 10] });

    expect(scale.domain).toEqual([4.5, 5.5]);
    expect(scale.map(5)).toBe(5);
  });

  it("clamps mapped values when requested", () => {
    const scale = createLinearScale({ domain: [0, 10], range: [0, 100], clamp: true });

    expect(scale.map(-1)).toBe(0);
    expect(scale.map(11)).toBe(100);
  });
});

describe("createBandScale", () => {
  it("maps domain values to bands", () => {
    const scale = createBandScale({ domain: ["a", "b", "c"], range: [0, 30] });

    expect(scale.bandwidth).toBe(10);
    expect(scale.map("a")).toBe(0);
    expect(scale.map("b")).toBe(10);
    expect(scale.map("c")).toBe(20);
    expect(scale.map("missing")).toBeUndefined();
  });

  it("supports inner padding", () => {
    const scale = createBandScale({ domain: ["a", "b"], range: [0, 30], paddingInner: 1 });

    expect(scale.bandwidth).toBe(10);
    expect(scale.map("a")).toBe(0);
    expect(scale.map("b")).toBe(20);
  });
});
