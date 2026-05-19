import { describe, expect, it } from "vitest";
import type { FrameBufferCellStyle, FrameBufferLike } from "../src/frame-buffer-like";
import { renderCommandsToFrameBuffer } from "../src/render-commands-to-frame-buffer";

class TestFrameBuffer implements FrameBufferLike {
  width: number;
  height: number;
  private cells: string[][];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.cells = Array.from({ length: height }, () => Array.from({ length: width }, () => " "));
  }

  setCell(x: number, y: number, char: string, _style?: FrameBufferCellStyle): void {
    this.cells[y]![x] = char;
  }

  toString(): string {
    return this.cells.map((row) => row.join("")).join("\n");
  }
}

describe("renderCommandsToFrameBuffer", () => {
  it("renders commands into a frame buffer", () => {
    const frameBuffer = new TestFrameBuffer(5, 3);

    renderCommandsToFrameBuffer(frameBuffer, [
      { type: "text", x: 0, y: 0, text: "Hi" },
      { type: "rect", x: 0, y: 1, width: 2, height: 1, char: "#" },
      { type: "line", x1: 2, y1: 1, x2: 4, y2: 2, char: "*" },
    ]);

    expect(frameBuffer.toString()).toBe("Hi   \n##** \n    *");
  });

  it("clips to optional frame buffer bounds", () => {
    const frameBuffer = new TestFrameBuffer(3, 1);

    renderCommandsToFrameBuffer(frameBuffer, [{ type: "text", x: -1, y: 0, text: "abcd" }]);

    expect(frameBuffer.toString()).toBe("bcd");
  });
});
