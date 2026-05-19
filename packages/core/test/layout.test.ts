import { describe, expect, it } from "vitest";
import { createChartLayout } from "../src/layout/chart-layout";

describe("createChartLayout", () => {
  it("creates outer and plot bounds", () => {
    expect(
      createChartLayout({
        size: { width: 10, height: 5 },
        padding: { top: 1, right: 2, bottom: 1, left: 2 },
      }),
    ).toEqual({
      outerBounds: { x: 0, y: 0, width: 10, height: 5 },
      plotBounds: { x: 2, y: 1, width: 6, height: 3 },
    });
  });

  it("does not produce negative plot dimensions", () => {
    expect(
      createChartLayout({
        size: { width: 2, height: 2 },
        padding: { top: 10, right: 10, bottom: 10, left: 10 },
      }).plotBounds,
    ).toEqual({ x: 10, y: 10, width: 0, height: 0 });
  });
});
