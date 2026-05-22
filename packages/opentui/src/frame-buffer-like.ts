import type { ChartColor } from "@opentui-charts/core";

/**
 * Style applied to a single terminal cell by the OpenTUI adapter layer.
 *
 * Foreground and background values use core chart color strings. Adapters may
 * translate them to renderer-native colors and should fall back when parsing
 * fails or a channel is omitted.
 */
export type FrameBufferCellStyle = {
  fg?: ChartColor;
  bg?: ChartColor;
};

/**
 * Minimal frame-buffer surface consumed by adapter draw-command rendering.
 *
 * Coordinates are zero-based with the origin at the top-left of the chart
 * bounds. Optional `width` and `height` define clipping bounds for the adapter;
 * calls outside those bounds are ignored by the command renderer before they
 * reach `setCell`.
 */
export type FrameBufferLike = {
  width?: number;
  height?: number;
  setCell(x: number, y: number, char: string, style?: FrameBufferCellStyle): void;
};
