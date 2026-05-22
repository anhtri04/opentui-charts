import type { ChartSize, DrawCommand } from "./commands";

/**
 * Renders draw commands into a newline-delimited string for tests and plain text output.
 */
export function renderCommandsToString(
  commands: readonly DrawCommand[],
  size: ChartSize,
): string {
  const width = normalizeDimension(size.width);
  const height = normalizeDimension(size.height);

  if (width === 0 || height === 0) return "";

  const grid = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => " "),
  );

  const setCell = (x: number, y: number, char: string): void => {
    const cellX = Math.round(x);
    const cellY = Math.round(y);

    // Clipping happens at the cell write boundary so every command type shares it.
    if (cellX < 0 || cellY < 0 || cellX >= width || cellY >= height) return;

    grid[cellY]![cellX] = firstCellChar(char);
  };

  for (const command of commands) {
    switch (command.type) {
      case "cell": {
        setCell(command.x, command.y, command.char);
        break;
      }

      case "text": {
        const startX = Math.round(command.x);
        const y = Math.round(command.y);
        const maxWidth = Math.max(0, Math.floor(command.maxWidth ?? width - startX));
        const text = command.text.slice(0, maxWidth);

        for (let i = 0; i < text.length; i++) {
          setCell(startX + i, y, text[i]!);
        }
        break;
      }

      case "rect": {
        const char = command.char ?? " ";
        const rectWidth = Math.max(0, Math.floor(command.width));
        const rectHeight = Math.max(0, Math.floor(command.height));
        const startX = Math.round(command.x);
        const startY = Math.round(command.y);

        for (let y = 0; y < rectHeight; y++) {
          for (let x = 0; x < rectWidth; x++) {
            setCell(startX + x, startY + y, char);
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
          setCell,
        });
        break;
      }
    }
  }

  return grid.map((row) => row.join("")).join("\n");
}

function normalizeDimension(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value));
}

function firstCellChar(value: string): string {
  // Commands paint one terminal cell, so multi-code-point strings collapse to one character.
  return Array.from(value)[0] ?? " ";
}

function drawLine(input: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  char: string;
  setCell: (x: number, y: number, char: string) => void;
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
    input.setCell(x1, y1, input.char);

    if (x1 === x2 && y1 === y2) break;

    // Integer error accumulation keeps line rasterization deterministic across renderers.
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
