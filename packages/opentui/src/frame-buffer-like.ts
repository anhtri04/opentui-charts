import type { ChartColor } from "@opentui-charts/core";

export type FrameBufferCellStyle = {
  fg?: ChartColor;
  bg?: ChartColor;
};

export type FrameBufferLike = {
  width?: number;
  height?: number;
  setCell(x: number, y: number, char: string, style?: FrameBufferCellStyle): void;
};
