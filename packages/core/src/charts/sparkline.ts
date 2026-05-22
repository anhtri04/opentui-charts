import type { ChartColor, DrawCommand, RenderMode } from "../commands";
import { clamp } from "../geometry";

/**
 * Options for creating sparkline draw commands.
 *
 * `width` and `height` are floored to non-negative integer cell dimensions; zero,
 * negative, or non-finite dimensions render no commands. `height` defaults to `1`.
 * `renderMode` defaults to `"unicode"`; use `"ascii"` for ASCII-only glyphs.
 * Non-finite or non-number values in `data` are ignored before rendering. Empty
 * normalized data renders clipped `No data` fallback text.
 *
 * When `showValue` is true, the latest normalized value is rendered to the right
 * of the plot. `valueFormatter`, when supplied, formats only that value text and
 * owns any units or localization. If the value text leaves no room for the plot,
 * only clipped value text is rendered.
 */
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

/**
 * Creates pure draw commands for a sparkline.
 *
 * Data is filtered to finite numbers, sampled to the available plot width, and
 * drawn as a one-row level sparkline or as point markers across multiple rows.
 * Invalid dimensions return no commands. Empty normalized data renders `No data`
 * clipped to the requested width. The default render mode is `"unicode"`.
 */
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

/**
 * Returns only finite numeric values from arbitrary sparkline input data.
 */
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
    // Preserve both endpoints while choosing representative source points across the full series.
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
