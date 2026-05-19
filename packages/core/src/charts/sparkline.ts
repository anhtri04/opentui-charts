import type { ChartColor, DrawCommand, RenderMode } from "../commands";
import { clamp } from "../geometry";

export type SparklineOptions = {
  data: readonly unknown[];
  width: number;
  height?: number;
  renderMode?: RenderMode;
  min?: number;
  max?: number;
  showValue?: boolean;
  valueFormatter?: (value: number) => string;
  fg?: ChartColor;
};

const unicodeLevels = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"] as const;
const asciiLevels = [".", "_", "-", "=", "+", "*", "#", "#"] as const;

export function createSparklineCommands(options: SparklineOptions): DrawCommand[] {
  const width = normalizeDimension(options.width);
  const height = normalizeDimension(options.height ?? 1);

  if (width < 1 || height < 1) return [];

  const data = normalizeNumericData(options.data);
  if (data.length === 0) return fallbackText("No data", width, options.fg);

  const latestValue = data[data.length - 1]!;
  const valueText = options.showValue ? formatValue(latestValue, options.valueFormatter) : "";
  const valueGap = valueText.length > 0 ? 1 : 0;
  const plotWidth = Math.max(0, width - valueText.length - valueGap);

  if (plotWidth < 1) {
    return valueText.length > 0 ? [{ type: "text", x: 0, y: 0, text: valueText, maxWidth: width, fg: options.fg }] : [];
  }

  const sampled = sampleData(data, plotWidth);
  const min = finiteOrDefault(options.min, Math.min(...data));
  const max = finiteOrDefault(options.max, Math.max(...data));
  const [domainMin, domainMax] = normalizeDomain(min, max);

  const commands: DrawCommand[] = height === 1
    ? createSingleLineCommands(sampled, domainMin, domainMax, options.renderMode ?? "unicode", options.fg)
    : createMultiLineCommands(sampled, domainMin, domainMax, height, options.renderMode ?? "unicode", options.fg);

  if (valueText.length > 0) {
    commands.push({
      type: "text",
      x: sampled.length + valueGap,
      y: 0,
      text: valueText,
      maxWidth: Math.max(0, width - plotWidth - valueGap),
      fg: options.fg,
    });
  }

  return commands;
}

function createSingleLineCommands(
  data: readonly number[],
  min: number,
  max: number,
  renderMode: RenderMode,
  fg: ChartColor | undefined,
): DrawCommand[] {
  const levels = renderMode === "ascii" ? asciiLevels : unicodeLevels;

  return data.map((value, x) => ({
    type: "cell" as const,
    x,
    y: 0,
    char: valueToLevel(value, min, max, levels),
    fg,
  }));
}

function createMultiLineCommands(
  data: readonly number[],
  min: number,
  max: number,
  height: number,
  renderMode: RenderMode,
  fg: ChartColor | undefined,
): DrawCommand[] {
  const char = renderMode === "ascii" ? "*" : "•";

  return data.map((value, x) => ({
    type: "cell" as const,
    x,
    y: valueToY(value, min, max, height),
    char,
    fg,
  }));
}

export function normalizeNumericData(data: readonly unknown[]): number[] {
  return data.filter((value): value is number => typeof value === "number" && Number.isFinite(value));
}

function sampleData(data: readonly number[], width: number): number[] {
  if (data.length <= width) return [...data];
  if (width === 1) return [data[data.length - 1]!];

  const result: number[] = [];
  const lastSourceIndex = data.length - 1;
  const lastTargetIndex = width - 1;

  for (let i = 0; i < width; i++) {
    const sourceIndex = Math.round((i / lastTargetIndex) * lastSourceIndex);
    result.push(data[sourceIndex]!);
  }

  return result;
}

function valueToLevel(value: number, min: number, max: number, levels: readonly string[]): string {
  if (max === min) return levels[Math.floor((levels.length - 1) / 2)]!;

  const t = (clamp(value, min, max) - min) / (max - min);
  const index = Math.round(t * (levels.length - 1));
  return levels[clamp(index, 0, levels.length - 1)]!;
}

function valueToY(value: number, min: number, max: number, height: number): number {
  const t = max === min ? 0.5 : (clamp(value, min, max) - min) / (max - min);
  return clamp(Math.round((1 - t) * (height - 1)), 0, height - 1);
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

function formatValue(value: number, formatter: ((value: number) => string) | undefined): string {
  return formatter ? formatter(value) : String(value);
}

function fallbackText(text: string, width: number, fg: ChartColor | undefined): DrawCommand[] {
  return [{ type: "text", x: 0, y: 0, text, maxWidth: width, fg }];
}
