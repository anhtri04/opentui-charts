import { RGBA, type OptimizedBuffer, parseColor } from "@opentui/core";
import type { ChartColor } from "@opentui-charts/core";
import type { FrameBufferCellStyle, FrameBufferLike } from "./frame-buffer-like";

export type OpenTUIFrameBufferAdapterOptions = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  defaultFg?: ChartColor;
  defaultBg?: ChartColor;
};

export function createOpenTUIFrameBufferAdapter(
  buffer: OptimizedBuffer,
  options: OpenTUIFrameBufferAdapterOptions = {},
): FrameBufferLike {
  const offsetX = options.x ?? 0;
  const offsetY = options.y ?? 0;
  const defaultFg = toRGBA(options.defaultFg, RGBA.defaultForeground());
  const defaultBg = toRGBA(options.defaultBg, RGBA.defaultBackground());

  return {
    width: options.width,
    height: options.height,
    setCell(x: number, y: number, char: string, style?: FrameBufferCellStyle): void {
      buffer.setCell(
        offsetX + x,
        offsetY + y,
        char,
        toRGBA(style?.fg, defaultFg),
        toRGBA(style?.bg, defaultBg),
      );
    },
  };
}

function toRGBA(color: ChartColor | undefined, fallback: RGBA): RGBA {
  if (!color) return fallback;

  try {
    return parseColor(color);
  } catch {
    return fallback;
  }
}
