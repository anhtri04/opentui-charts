import type { ChartColor, DrawCommand, RenderMode } from "../commands";
import { clamp } from "../geometry";
import { createLinearScale } from "../scale/linear";

/**
 * Normalized point used by the line chart renderer.
 *
 * Public input may be plain numbers or objects; accepted object values are
 * converted to this shape by {@link normalizeLineData}. Points are sorted by
 * ascending `x` before plotting.
 */
export type LineChartPoint = {
  /** X coordinate in data space. Plain numeric input uses the array index. */
  x: number;
  /** Y coordinate in data space. Non-finite values are filtered out. */
  y: number;
  /** Optional user label preserved from object input for callers that inspect normalized data. */
  label?: string;
  /** Original datum preserved for callers that inspect normalized data. */
  raw?: unknown;
};

/**
 * Options for creating terminal draw commands for a line chart.
 *
 * Dimensions are floored to integer cells and clamped to zero or greater. A
 * zero width or height renders no commands; very small charts render clipped
 * fallback text. The default `renderMode` is `"unicode"`; `"ascii"` selects
 * ASCII-safe glyphs. Axis options default to enabled through `showAxis`, while
 * `showXAxis` and `showYAxis` can override each axis independently. Grid lines
 * are opt-in with `showGrid`.
 */
export type LineChartOptions = {
  /**
   * Input data as finite numbers, `{ y }`/`{ value }` objects, or `{ x, y }` /
   * `{ x, value }` objects. Invalid values are skipped.
   */
  data: readonly unknown[];
  /** Chart width in terminal cells. */
  width: number;
  /** Chart height in terminal cells. */
  height: number;
  /** Rendering glyph family; defaults to `"unicode"`. */
  renderMode?: RenderMode;
  /** Optional lower y-domain bound; ignored when non-finite. */
  min?: number;
  /** Optional upper y-domain bound; ignored when non-finite. */
  max?: number;
  /** Enables or disables both axes unless overridden by `showXAxis` or `showYAxis`; defaults to `true`. */
  showAxis?: boolean;
  /** Enables or disables the bottom x-axis; defaults to `showAxis`. */
  showXAxis?: boolean;
  /** Enables or disables the left y-axis labels and axis line; defaults to `showAxis`. */
  showYAxis?: boolean;
  /** Enables or disables the single middle horizontal grid line; defaults to `false`. */
  showGrid?: boolean;
  /** Formats visible y-axis boundary labels; units and localization are caller-owned. */
  valueFormatter?: (value: number) => string;
  /** Foreground color for the plotted line. */
  fg?: ChartColor;
  /** Foreground color for axis lines and y-axis labels. */
  axisColor?: ChartColor;
  /** Foreground color for grid lines. */
  gridColor?: ChartColor;
  /** Overrides the glyph used for plotted line segments and single-point charts. */
  lineChar?: string;
};

/**
 * Creates draw commands for a line chart.
 *
 * Invalid numeric data is filtered, object input is normalized and sorted by
 * ascending `x`, and line samples are reduced to the available plot width while
 * preserving endpoints when the plot is wide enough for both ends. Empty data
 * renders `No data`; equal y-domains are handled by the linear scale rather
 * than throwing. Commands are pure draw instructions and do not perform
 * terminal I/O.
 */
export function createLineChartCommands(options: LineChartOptions): DrawCommand[] {
  const width = normalizeDimension(options.width);
  const height = normalizeDimension(options.height);

  if (width < 1 || height < 1) return [];
  if (width < 4 || height < 2) return fallbackText("Chart too small", width, options.fg);

  const points = normalizeLineData(options.data);
  if (points.length === 0) return fallbackText("No data", width, options.fg);

  const renderMode = options.renderMode ?? "unicode";
  const showAxis = options.showAxis ?? true;
  const showXAxis = options.showXAxis ?? showAxis;
  const showYAxis = options.showYAxis ?? showAxis;
  const showGrid = options.showGrid ?? false;
  const chars = getLineChartChars(renderMode);
  const min = finiteOrDefault(options.min, Math.min(...points.map((point) => point.y)));
  const max = finiteOrDefault(options.max, Math.max(...points.map((point) => point.y)));
  const [domainMin, domainMax] = normalizeDomain(min, max);
  const formatter = options.valueFormatter ?? defaultValueFormatter;
  // Reserve only enough columns for the largest visible y-axis boundary label plus the axis line.
  const yAxisWidth = showYAxis ? computeYAxisWidth(domainMin, domainMax, formatter, width) : 0;
  const xAxisHeight = showXAxis ? 1 : 0;
  const plotX = yAxisWidth;
  const plotY = 0;
  const plotWidth = width - yAxisWidth;
  const plotHeight = height - xAxisHeight;

  if (plotWidth < 1 || plotHeight < 1) return fallbackText("Chart too small", width, options.fg);

  const commands: DrawCommand[] = [];

  if (showGrid) {
    commands.push(...createGridCommands({
      plotX,
      plotY,
      plotWidth,
      plotHeight,
      char: chars.grid,
      fg: options.gridColor,
    }));
  }

  if (showYAxis) {
    commands.push(...createYAxisCommands({
      domainMin,
      domainMax,
      formatter,
      axisX: yAxisWidth - 1,
      plotY,
      plotHeight,
      chars,
      fg: options.axisColor,
    }));
  }

  if (showXAxis) {
    commands.push({
      type: "line",
      x1: plotX,
      y1: height - 1,
      x2: width - 1,
      y2: height - 1,
      char: chars.horizontalAxis,
      fg: options.axisColor,
    });
  }

  const sampled = samplePoints(points, plotWidth);
  const xScale = createLinearScale({
    domain: [sampled[0]!.x, sampled[sampled.length - 1]!.x],
    range: [plotX, plotX + plotWidth - 1],
    clamp: true,
  });
  const yScale = createLinearScale({
    domain: [domainMin, domainMax],
    range: [plotY + plotHeight - 1, plotY],
    clamp: true,
  });
  const lineChar = options.lineChar ?? chars.line;
  const plotted = sampled.map((point) => ({
    x: Math.round(xScale.map(point.x)),
    y: Math.round(yScale.map(point.y)),
  }));

  for (let i = 1; i < plotted.length; i++) {
    const previous = plotted[i - 1]!;
    const current = plotted[i]!;
    commands.push({
      type: "line",
      x1: previous.x,
      y1: previous.y,
      x2: current.x,
      y2: current.y,
      char: lineChar,
      fg: options.fg,
    });
  }

  if (plotted.length === 1) {
    commands.push({ type: "cell", x: plotted[0]!.x, y: plotted[0]!.y, char: lineChar, fg: options.fg });
  }

  return commands;
}

/**
 * Converts accepted line chart input into finite, x-sorted points.
 *
 * Accepted data shapes are finite numbers, objects with finite `y`, and objects
 * with finite `value`; object `x` is used when finite and otherwise defaults to
 * the datum index. Non-object, missing, and non-finite values are skipped.
 */
export function normalizeLineData(data: readonly unknown[]): LineChartPoint[] {
  const points: LineChartPoint[] = [];

  data.forEach((datum, index) => {
    if (typeof datum === "number" && Number.isFinite(datum)) {
      points.push({ x: index, y: datum, raw: datum });
      return;
    }

    if (!isRecord(datum)) return;

    const x = typeof datum.x === "number" && Number.isFinite(datum.x) ? datum.x : index;
    const y = typeof datum.y === "number" && Number.isFinite(datum.y)
      ? datum.y
      : typeof datum.value === "number" && Number.isFinite(datum.value)
        ? datum.value
        : undefined;

    if (y === undefined) return;
    points.push({ x, y, label: typeof datum.label === "string" ? datum.label : undefined, raw: datum });
  });

  return points.sort((a, b) => a.x - b.x);
}

function createYAxisCommands(input: {
  domainMin: number;
  domainMax: number;
  formatter: (value: number) => string;
  axisX: number;
  plotY: number;
  plotHeight: number;
  chars: LineChartChars;
  fg?: ChartColor;
}): DrawCommand[] {
  const commands: DrawCommand[] = [
    {
      type: "line",
      x1: input.axisX,
      y1: input.plotY,
      x2: input.axisX,
      y2: input.plotY + input.plotHeight - 1,
      char: input.chars.verticalAxis,
      fg: input.fg,
    },
  ];
  const topLabel = input.formatter(input.domainMax);
  const bottomLabel = input.formatter(input.domainMin);
  const labelWidth = Math.max(topLabel.length, bottomLabel.length);

  commands.push({ type: "text", x: 0, y: input.plotY, text: topLabel.padStart(labelWidth), maxWidth: labelWidth, fg: input.fg });

  if (input.plotHeight > 1) {
    commands.push({
      type: "text",
      x: 0,
      y: input.plotY + input.plotHeight - 1,
      text: bottomLabel.padStart(labelWidth),
      maxWidth: labelWidth,
      fg: input.fg,
    });
  }

  return commands;
}

function createGridCommands(input: {
  plotX: number;
  plotY: number;
  plotWidth: number;
  plotHeight: number;
  char: string;
  fg?: ChartColor;
}): DrawCommand[] {
  if (input.plotHeight < 3) return [];

  const middleY = input.plotY + Math.floor(input.plotHeight / 2);
  return [{ type: "line", x1: input.plotX, y1: middleY, x2: input.plotX + input.plotWidth - 1, y2: middleY, char: input.char, fg: input.fg }];
}

function samplePoints(points: readonly LineChartPoint[], width: number): LineChartPoint[] {
  if (points.length <= width) return [...points];
  if (width === 1) return [points[points.length - 1]!];

  const result: LineChartPoint[] = [];
  const lastSourceIndex = points.length - 1;
  const lastTargetIndex = width - 1;

  for (let i = 0; i < width; i++) {
    // Map first and last output columns exactly to the source endpoints while spreading interior samples evenly.
    const sourceIndex = Math.round((i / lastTargetIndex) * lastSourceIndex);
    result.push(points[sourceIndex]!);
  }

  return result;
}

function computeYAxisWidth(
  min: number,
  max: number,
  formatter: (value: number) => string,
  chartWidth: number,
): number {
  const labelWidth = Math.max(formatter(min).length, formatter(max).length);
  return clamp(labelWidth + 1, 2, Math.max(2, chartWidth - 1));
}

function normalizeDimension(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value));
}

function finiteOrDefault(value: number | undefined, fallback: number): number {
  return value !== undefined && Number.isFinite(value) ? value : fallback;
}

function normalizeDomain(min: number, max: number): [number, number] {
  if (min <= max) return [min, max];
  return [max, min];
}

function defaultValueFormatter(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function fallbackText(text: string, width: number, fg: ChartColor | undefined): DrawCommand[] {
  return [{ type: "text", x: 0, y: 0, text, maxWidth: width, fg }];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

type LineChartChars = {
  line: string;
  horizontalAxis: string;
  verticalAxis: string;
  grid: string;
};

function getLineChartChars(renderMode: RenderMode): LineChartChars {
  // ASCII mode uses transport-safe glyphs; unicode mode favors terminal-native line accents.
  if (renderMode === "ascii") {
    return { line: "*", horizontalAxis: "-", verticalAxis: "|", grid: "." };
  }

  return { line: "•", horizontalAxis: "─", verticalAxis: "│", grid: "·" };
}
