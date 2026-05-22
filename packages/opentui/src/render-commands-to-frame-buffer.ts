import type { DrawCommand } from "@opentui-charts/core";
import type { FrameBufferCellStyle, FrameBufferLike } from "./frame-buffer-like";

/**
 * Paints core draw commands into a minimal frame-buffer target.
 *
 * This is the boundary between pure chart command generation and a renderer
 * backend. Command coordinates are rounded to integer terminal cells with the
 * origin at the top-left of the supplied `FrameBufferLike`. When `width` or
 * `height` are present, writes are clipped to those bounds; negative
 * coordinates are always skipped. Commands are applied in array order, so later
 * commands paint over earlier cells. `fg` and `bg` values are passed through as
 * frame-buffer style data for the concrete adapter to translate.
 */
export function renderCommandsToFrameBuffer(
  frameBuffer: FrameBufferLike,
  commands: readonly DrawCommand[],
): void {
  const setCell = (x: number, y: number, char: string, style?: FrameBufferCellStyle): void => {
    const cellX = Math.round(x);
    const cellY = Math.round(y);

    if (frameBuffer.width !== undefined && (cellX < 0 || cellX >= frameBuffer.width)) return;
    if (frameBuffer.height !== undefined && (cellY < 0 || cellY >= frameBuffer.height)) return;
    if (cellX < 0 || cellY < 0) return;

    frameBuffer.setCell(cellX, cellY, firstCellChar(char), style);
  };

  for (const command of commands) {
    switch (command.type) {
      case "cell": {
        setCell(command.x, command.y, command.char, styleOf(command));
        break;
      }

      case "text": {
        const startX = Math.round(command.x);
        const y = Math.round(command.y);
        const maxWidth = Math.max(0, Math.floor(command.maxWidth ?? effectiveTextWidth(frameBuffer, startX)));
        const text = command.text.slice(0, maxWidth);

        for (let i = 0; i < text.length; i++) {
          setCell(startX + i, y, text[i]!, styleOf(command));
        }
        break;
      }

      case "rect": {
        const rectWidth = Math.max(0, Math.floor(command.width));
        const rectHeight = Math.max(0, Math.floor(command.height));
        const startX = Math.round(command.x);
        const startY = Math.round(command.y);

        for (let y = 0; y < rectHeight; y++) {
          for (let x = 0; x < rectWidth; x++) {
            setCell(startX + x, startY + y, command.char ?? " ", styleOf(command));
          }
        }
        break;
      }

      case "line": {
        drawLine({
          x1: command.x1,
          y1: command.y1,
          x2: command.x2,
          y2: command.y2,
          char: command.char ?? "*",
          style: styleOf(command),
          setCell,
        });
        break;
      }
    }
  }
}

function effectiveTextWidth(frameBuffer: FrameBufferLike, startX: number): number {
  if (frameBuffer.width === undefined) return Number.MAX_SAFE_INTEGER;
  return Math.max(0, frameBuffer.width - startX);
}

function firstCellChar(value: string): string {
  // Frame buffers store one terminal cell at a time; keep only the first code point.
  return Array.from(value)[0] ?? " ";
}

function styleOf(command: { fg?: string; bg?: string }): FrameBufferCellStyle | undefined {
  if (command.fg === undefined && command.bg === undefined) return undefined;
  return { fg: command.fg, bg: command.bg };
}

function drawLine(input: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  char: string;
  style?: FrameBufferCellStyle;
  setCell: (x: number, y: number, char: string, style?: FrameBufferCellStyle) => void;
}): void {
  let x1 = Math.round(input.x1);
  let y1 = Math.round(input.y1);
  const x2 = Math.round(input.x2);
  const y2 = Math.round(input.y2);

  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  const sx = x1 < x2 ? 1 : -1;
  const sy = y1 < y2 ? 1 : -1;

  let error = dx - dy;

  while (true) {
    input.setCell(x1, y1, input.char, input.style);

    if (x1 === x2 && y1 === y2) break;

    const error2 = 2 * error;

    if (error2 > -dy) {
      error -= dy;
      x1 += sx;
    }

    if (error2 < dx) {
      error += dx;
      y1 += sy;
    }
  }
}
