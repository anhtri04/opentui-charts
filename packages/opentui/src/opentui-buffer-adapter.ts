import { RGBA, type OptimizedBuffer, parseColor } from "@opentui/core";
import type { ChartColor } from "@opentui-charts/core";
import type { FrameBufferCellStyle, FrameBufferLike } from "./frame-buffer-like";

/**
 * Placement, clipping, and color defaults for an OpenTUI frame-buffer adapter.
 *
 * `x` and `y` offset chart-local coordinates into the OpenTUI buffer. `width`
 * and `height` are chart-local clipping bounds consumed by
 * `renderCommandsToFrameBuffer`. `defaultFg` and `defaultBg` are used when a
 * command omits a color or when a chart color cannot be parsed by OpenTUI.
 */
export type OpenTUIFrameBufferAdapterOptions = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  defaultFg?: ChartColor;
  defaultBg?: ChartColor;
};

/**
 * Wraps an OpenTUI `OptimizedBuffer` as a chart `FrameBufferLike`.
 *
 * The returned adapter preserves the core coordinate convention: chart-local
 * `(0, 0)` is the top-left cell, then `x`/`y` offsets place that cell in the
 * OpenTUI buffer. Command paint order is preserved by forwarding each write
 * directly. Foreground and background chart colors are converted to OpenTUI
 * `RGBA`; omitted or invalid colors fall back to the configured defaults, then
 * to OpenTUI's default foreground/background colors.
 */
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
    // Keep rendering resilient when a user-supplied color is not OpenTUI-compatible.
    return fallback;
  }
}
