import type { ChartColor, DrawCommand, RenderMode } from "../commands";
import { clamp } from "../geometry";
import { createLinearScale } from "../scale/linear";

export type LineChartPoint = {
  x: number;
  y: number;
  label?: string;
  raw?: unknown;
};

export type LineChartOptions = {
  data: readonly unknown[];
  width: number;
  height: number;
  renderMode?: RenderMode;
  min?: number;
  max?: number;
  showAxis?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  showGrid?: boolean;
  valueFormatter?: (value: number) => string;
  fg?: ChartColor;
  axisColor?: ChartColor;
  gridColor?: ChartColor;
  lineChar?: string;
};

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
  if (renderMode === "ascii") {
    return { line: "*", horizontalAxis: "-", verticalAxis: "|", grid: "." };
  }

  return { line: "•", horizontalAxis: "─", verticalAxis: "│", grid: "·" };
}
