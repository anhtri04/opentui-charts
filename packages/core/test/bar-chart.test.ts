import { describe, expect, it } from "vitest";
import { createBarChartCommands } from "../src/charts/bar-chart";
import { renderCommandsToString } from "../src/render-commands-to-string";

function render(options: Parameters<typeof createBarChartCommands>[0]): string {
  return renderCommandsToString(createBarChartCommands(options), {
    width: Math.max(0, Math.floor(options.width)),
    height: Math.max(0, Math.floor(options.height ?? options.data.length)),
  });
}

describe("createBarChartCommands", () => {
  it("renders unicode horizontal bars", () => {
    expect(
      render({
        data: [
          { label: "2xx", value: 80 },
          { label: "4xx", value: 20 },
        ],
        width: 12,
      }),
    ).toBe("2xx █████ 80\n4xx █     20");
  });

  it("renders ascii horizontal bars", () => {
    expect(
      render({
        data: [
          { label: "a", value: 3 },
          { label: "b", value: 1 },
        ],
        width: 8,
        renderMode: "ascii",
      }),
    ).toBe("a #### 3\nb #    1");
  });

  it("renders No data for empty or invalid data", () => {
    expect(render({ data: [{ label: "bad", value: -1 }], width: 8 })).toBe("No data ");
  });

  it("clips labels", () => {
    expect(render({ data: [{ label: "abcdef", value: 10 }], width: 10, labelWidth: 3 })).toBe("abc ███ 10");
  });

  it("clips rows by height", () => {
    expect(
      render({
        data: [
          { label: "a", value: 1 },
          { label: "b", value: 1 },
        ],
        width: 6,
        height: 1,
      }),
    ).toBe("a ██ 1");
  });

  it("handles all-zero values", () => {
    expect(render({ data: [{ label: "zero", value: 0 }], width: 8 })).toBe("zero   0");
  });

  it("returns no commands for zero width or height", () => {
    expect(createBarChartCommands({ data: [{ label: "a", value: 1 }], width: 0 })).toEqual([]);
    expect(createBarChartCommands({ data: [{ label: "a", value: 1 }], width: 8, height: 0 })).toEqual([]);
  });

  it("renders a tiny fallback", () => {
    expect(render({ data: [{ label: "a", value: 1 }], width: 3 })).toBe("…  ");
  });
});
