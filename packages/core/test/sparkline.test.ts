import { describe, expect, it } from "vitest";
import { createSparklineCommands } from "../src/charts/sparkline";
import { renderCommandsToString } from "../src/render-commands-to-string";

function render(options: Parameters<typeof createSparklineCommands>[0]): string {
  return renderCommandsToString(createSparklineCommands(options), {
    width: Math.max(0, Math.floor(options.width)),
    height: Math.max(0, Math.floor(options.height ?? 1)),
  });
}

describe("createSparklineCommands", () => {
  it("renders a unicode single-line sparkline", () => {
    expect(render({ data: [0, 1, 2, 3], width: 4 })).toBe("▁▃▆█");
  });

  it("renders an ascii single-line sparkline", () => {
    expect(render({ data: [0, 1, 2, 3], width: 4, renderMode: "ascii" })).toBe(".-*#");
  });

  it("renders No data for empty or invalid data", () => {
    expect(render({ data: [NaN, Infinity, "x"], width: 8 })).toBe("No data ");
  });

  it("clips to width", () => {
    expect(render({ data: [0, 1, 2, 3, 4], width: 3 })).toBe("▁▅█");
  });

  it("handles equal values", () => {
    expect(render({ data: [5, 5, 5], width: 3 })).toBe("▄▄▄");
  });

  it("returns no commands for zero width or height", () => {
    expect(createSparklineCommands({ data: [1, 2, 3], width: 0 })).toEqual([]);
    expect(createSparklineCommands({ data: [1, 2, 3], width: 3, height: 0 })).toEqual([]);
  });

  it("renders a multi-line sparkline", () => {
    expect(render({ data: [0, 1, 2], width: 3, height: 3, renderMode: "ascii" })).toBe(
      "  *\n * \n*  ",
    );
  });

  it("can show the latest value", () => {
    expect(render({ data: [1, 2, 3], width: 7, showValue: true })).toBe("▁▅█ 3  ");
  });
});
