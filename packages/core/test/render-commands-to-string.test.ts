import { describe, expect, it } from "vitest";
import { renderCommandsToString } from "../src/render-commands-to-string";

const size = { width: 5, height: 3 };

describe("renderCommandsToString", () => {
  it("renders cells", () => {
    expect(renderCommandsToString([{ type: "cell", x: 1, y: 0, char: "x" }], size)).toBe(
      " x   \n     \n     ",
    );
  });

  it("uses command order as paint order", () => {
    expect(
      renderCommandsToString(
        [
          { type: "cell", x: 0, y: 0, char: "a" },
          { type: "cell", x: 0, y: 0, char: "b" },
        ],
        { width: 1, height: 1 },
      ),
    ).toBe("b");
  });

  it("clips out-of-bounds text", () => {
    expect(renderCommandsToString([{ type: "text", x: -1, y: 0, text: "abc" }], { width: 3, height: 1 })).toBe(
      "bc ",
    );
  });

  it("renders rect commands", () => {
    expect(renderCommandsToString([{ type: "rect", x: 1, y: 1, width: 3, height: 2, char: "#" }], size)).toBe(
      "     \n ### \n ### ",
    );
  });

  it("renders line commands deterministically", () => {
    expect(renderCommandsToString([{ type: "line", x1: 0, y1: 0, x2: 4, y2: 2, char: "*" }], size)).toBe(
      "**   \n  ** \n    *",
    );
  });
});
