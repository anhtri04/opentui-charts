export type ChartColor = string;

export type ChartSize = {
  width: number;
  height: number;
};

export type ChartBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type RenderMode = "ascii" | "unicode";

export type CellCommand = {
  type: "cell";
  x: number;
  y: number;
  char: string;
  fg?: ChartColor;
  bg?: ChartColor;
};

export type TextCommand = {
  type: "text";
  x: number;
  y: number;
  text: string;
  fg?: ChartColor;
  bg?: ChartColor;
  maxWidth?: number;
};

export type RectCommand = {
  type: "rect";
  x: number;
  y: number;
  width: number;
  height: number;
  char?: string;
  fg?: ChartColor;
  bg?: ChartColor;
};

export type LineCommand = {
  type: "line";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  char?: string;
  fg?: ChartColor;
  bg?: ChartColor;
};

export type DrawCommand = CellCommand | TextCommand | RectCommand | LineCommand;
