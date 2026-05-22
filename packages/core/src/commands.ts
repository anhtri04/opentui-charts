/**
 * Terminal color identifier passed through to render adapters.
 */
export type ChartColor = string;

/**
 * Width and height, in terminal cells, for a chart or render target.
 */
export type ChartSize = {
  width: number;
  height: number;
};

/**
 * Rectangular region in terminal-cell coordinates.
 */
export type ChartBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/**
 * Character set mode used by charts that support ASCII fallback.
 */
export type RenderMode = "ascii" | "unicode";

/**
 * Draws a single terminal cell.
 */
export type CellCommand = {
  type: "cell";
  x: number;
  y: number;
  char: string;
  fg?: ChartColor;
  bg?: ChartColor;
};

/**
 * Draws text starting at a terminal-cell position.
 */
export type TextCommand = {
  type: "text";
  x: number;
  y: number;
  text: string;
  fg?: ChartColor;
  bg?: ChartColor;
  maxWidth?: number;
};

/**
 * Fills a rectangular terminal-cell region with a character.
 */
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

/**
 * Draws a straight line between two terminal-cell positions.
 */
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

/**
 * Primitive draw instruction emitted by core chart functions.
 */
export type DrawCommand = CellCommand | TextCommand | RectCommand | LineCommand;
