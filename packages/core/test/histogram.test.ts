import { describe, expect, it } from "vitest";
import { createHistogramCommands } from "../src/charts/histogram";
import { renderCommandsToString } from "../src/render-commands-to-string";

function render(options: Parameters<typeof createHistogramCommands>[0]): string {
  return renderCommandsToString(createHistogramCommands(options), {
    width: Math.max(0, Math.floor(options.width)),
    height: Math.max(0, Math.floor(options.height ?? options.buckets ?? 8)),
  });
}

describe("createHistogramCommands", () => {
  it("renders a vertical unicode histogram by default", () => {
    expect(render({ data: [0, 1, 1, 2, 2, 2], width: 6, height: 3, buckets: 3 })).toBe(
      "    ██\n  ████\n██████",
    );
  });

  it("renders a vertical ascii histogram", () => {
    expect(render({ data: [0, 1, 1, 2, 2, 2], width: 6, height: 3, buckets: 3, renderMode: "ascii" })).toBe(
      "    ##\n  ####\n######",
    );
  });

  it("renders a horizontal histogram", () => {
    expect(
      render({
        data: [0, 1, 1, 2, 2, 2],
        width: 10,
        height: 3,
        buckets: 3,
        orientation: "horizontal",
        labelFormatter: ({ index }) => String(index),
      }),
    ).toBe("0 ██     1\n1 ████   2\n2 ██████ 3");
  });

  it("renders No data for empty or invalid data", () => {
    expect(render({ data: [NaN, Infinity, "x"], width: 8, height: 3 })).toBe("No data \n        \n        ");
  });

  it("returns no commands for zero width or height", () => {
    expect(createHistogramCommands({ data: [1, 2, 3], width: 0, height: 3 })).toEqual([]);
    expect(createHistogramCommands({ data: [1, 2, 3], width: 8, height: 0 })).toEqual([]);
  });

  it("renders a tiny fallback", () => {
    expect(render({ data: [1, 2, 3], width: 3, height: 2 })).toBe("…  \n   ");
  });

  it("handles equal values", () => {
    expect(render({ data: [5, 5, 5], width: 4, height: 2, buckets: 3 })).toBe("████\n████");
  });

  it("supports custom bar characters", () => {
    expect(render({ data: [0, 1, 1], width: 4, height: 2, buckets: 2, barChar: "*" })).toBe("  **\n****");
  });
});
