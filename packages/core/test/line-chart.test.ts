import { describe, expect, it } from "vitest";
import { createLineChartCommands, normalizeLineData } from "../src/charts/line-chart";
import { renderCommandsToString } from "../src/render-commands-to-string";

function render(options: Parameters<typeof createLineChartCommands>[0]): string {
  return renderCommandsToString(createLineChartCommands(options), {
    width: Math.max(0, Math.floor(options.width)),
    height: Math.max(0, Math.floor(options.height)),
  });
}

describe("createLineChartCommands", () => {
  it("renders a unicode line chart with axes", () => {
    expect(render({ data: [0, 1, 2], width: 6, height: 4 })).toBe(
      "2│   •\n │  • \n0│••  \n  ────",
    );
  });

  it("renders an ascii line chart without axes", () => {
    expect(render({ data: [0, 1, 2], width: 5, height: 3, showAxis: false, renderMode: "ascii" })).toBe(
      "    *\n  ** \n**   ",
    );
  });

  it("renders No data for empty or invalid data", () => {
    expect(render({ data: [NaN, Infinity, "x"], width: 8, height: 3 })).toBe("No data \n        \n        ");
  });

  it("renders a tiny fallback", () => {
    expect(render({ data: [1, 2, 3], width: 3, height: 2 })).toBe("Cha\n   ");
  });

  it("handles equal values", () => {
    expect(render({ data: [5, 5, 5], width: 6, height: 3, showAxis: false })).toBe(
      "      \n••••••\n      ",
    );
  });

  it("supports object data", () => {
    expect(normalizeLineData([{ x: 2, y: 20 }, { x: 1, value: 10 }, { y: 30 }, { x: 4, y: Infinity }])).toEqual([
      { x: 1, y: 10, label: undefined, raw: { x: 1, value: 10 } },
      { x: 2, y: 20, label: undefined, raw: { x: 2, y: 20 } },
      { x: 2, y: 30, label: undefined, raw: { y: 30 } },
    ]);
  });

  it("returns no commands for zero width or height", () => {
    expect(createLineChartCommands({ data: [1, 2, 3], width: 0, height: 3 })).toEqual([]);
    expect(createLineChartCommands({ data: [1, 2, 3], width: 3, height: 0 })).toEqual([]);
  });
});
