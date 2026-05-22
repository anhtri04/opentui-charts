import type { ChartColor, DrawCommand, RenderMode } from "../commands";
import { clamp } from "../geometry";
import { createBarChartCommands, type BarChartDatum } from "./bar-chart";

/** Orientation used to render histogram buckets. */
export type HistogramOrientation = "vertical" | "horizontal";

/**
 * Numeric domain span represented by a histogram bucket.
 *
 * Ranges are passed to `labelFormatter`. For non-equal domains, all buckets are
 * lower-inclusive and upper-exclusive except the final bucket, which includes
 * the exact maximum value.
 */
export type HistogramBucketRange = {
  /** Lower bucket boundary. */
  min: number;
  /** Upper bucket boundary. */
  max: number;
  /** Zero-based bucket index. */
  index: number;
};

/**
 * Options for creating terminal draw commands for a histogram.
 *
 * `data` accepts finite numbers only; other values are filtered out. Width and
 * height are floored to integer cells and clamped to zero or greater. A zero
 * width or height renders no commands, narrow charts render a clipped fallback,
 * and empty numeric data renders `No data`. The default `renderMode` is
 * `"unicode"`, default orientation is `"vertical"`, and the default bucket
 * count is the smaller of the default bucket count and chart width.
 */
export type HistogramOptions = {
  /** Input values; only finite numbers participate in bucket counts. */
  data: readonly unknown[];
  /** Chart width in terminal cells. */
  width: number;
  /**
   * Chart height in terminal cells. Defaults to `buckets` when provided, or the
   * default bucket count otherwise.
   */
  height?: number;
  /** Number of buckets; valid values are floored to at least one before bucket creation. */
  buckets?: number;
  /** Bucket rendering orientation; defaults to `"vertical"`. */
  orientation?: HistogramOrientation;
  /** Rendering glyph family; defaults to `"unicode"`. */
  renderMode?: RenderMode;
  /** Optional lower domain bound; ignored when non-finite. */
  min?: number;
  /** Optional upper domain bound; ignored when non-finite. */
  max?: number;
  /** Shows bucket counts in horizontal mode; defaults to `true` there. */
  showValues?: boolean;
  /** Formats horizontal-mode bucket counts; units and localization are caller-owned. */
  valueFormatter?: (count: number) => string;
  /** Formats bucket range labels used by horizontal mode and preserved bucket data. */
  labelFormatter?: (range: HistogramBucketRange) => string;
  /** Optional label width forwarded to the horizontal bar chart renderer. */
  labelWidth?: number;
  /** Overrides the glyph used to fill bars. */
  barChar?: string;
  /** Foreground color for bars and fallback text. */
  fg?: ChartColor;
};

const fallbackMinimumWidth = 4;
const defaultBucketCount = 8;

/**
 * Creates draw commands for a histogram.
 *
 * Values outside explicit `min`/`max` bounds are excluded from buckets. If the
 * domain is equal, a single bucket is emitted for values exactly equal to that
 * domain value. Horizontal orientation delegates to the bar chart renderer;
 * vertical orientation draws bottom-aligned bucket rectangles without labels or
 * axes. Commands are pure draw instructions and do not perform terminal I/O.
 */
export function createHistogramCommands(options: HistogramOptions): DrawCommand[] {
  const width = normalizeDimension(options.width);
  const height = normalizeDimension(options.height ?? options.buckets ?? defaultBucketCount);

  if (width < 1 || height < 1) return [];
  if (width < fallbackMinimumWidth) return fallbackText("…", width, options.fg);

  const values = normalizeNumericData(options.data);
  if (values.length === 0) return fallbackText("No data", width, options.fg);

  const min = finiteOrDefault(options.min, Math.min(...values));
  const max = finiteOrDefault(options.max, Math.max(...values));
  const [domainMin, domainMax] = normalizeDomain(min, max);
  const bucketCount = normalizeBucketCount(options.buckets ?? Math.min(defaultBucketCount, width));
  const labelFormatter = options.labelFormatter ?? defaultLabelFormatter;
  const buckets = createBuckets({
    values,
    bucketCount,
    min: domainMin,
    max: domainMax,
    labelFormatter,
  });
  const renderMode = options.renderMode ?? "unicode";
  const orientation = options.orientation ?? "vertical";

  if (orientation === "horizontal") {
    return createBarChartCommands({
      data: buckets.slice(0, height),
      width,
      height,
      renderMode,
      showValues: options.showValues ?? true,
      valueFormatter: options.valueFormatter,
      labelWidth: options.labelWidth,
      barChar: options.barChar,
      fg: options.fg,
    });
  }

  return createVerticalHistogramCommands({
    buckets,
    width,
    height,
    renderMode,
    barChar: options.barChar,
    fg: options.fg,
  });
}

function createVerticalHistogramCommands(input: {
  buckets: readonly BarChartDatum[];
  width: number;
  height: number;
  renderMode: RenderMode;
  barChar?: string;
  fg?: ChartColor;
}): DrawCommand[] {
  // TODO: Add optional axes and clipped bucket labels for vertical histograms once layout helpers are richer.
  const maxCount = Math.max(0, ...input.buckets.map((bucket) => bucket.value));
  if (maxCount <= 0) return [];

  const bucketWidth = Math.max(1, Math.floor(input.width / input.buckets.length));
  // Vertical bars are scaled against the largest bucket and anchored to the bottom row.
  const barChar = input.barChar ?? (input.renderMode === "ascii" ? "#" : "█");
  const commands: DrawCommand[] = [];

  input.buckets.forEach((bucket, index) => {
    const x = index * bucketWidth;
    if (x >= input.width) return;

    const barHeight = Math.round((bucket.value / maxCount) * input.height);
    const clampedBarHeight = clamp(barHeight, 0, input.height);
    if (clampedBarHeight < 1) return;

    commands.push({
      type: "rect",
      x,
      y: input.height - clampedBarHeight,
      width: Math.min(bucketWidth, input.width - x),
      height: clampedBarHeight,
      char: barChar,
      fg: input.fg,
    });
  });

  return commands;
}

function createBuckets(input: {
  values: readonly number[];
  bucketCount: number;
  min: number;
  max: number;
  labelFormatter: (range: HistogramBucketRange) => string;
}): BarChartDatum[] {
  if (input.min === input.max) {
    return [{
      label: input.labelFormatter({ min: input.min, max: input.max, index: 0 }),
      value: input.values.filter((value) => value === input.min).length,
    }];
  }

  const counts = Array.from({ length: input.bucketCount }, () => 0);
  const bucketSize = (input.max - input.min) / input.bucketCount;

  input.values.forEach((value) => {
    if (value < input.min || value > input.max) return;

    // Keep the final max value in range instead of overflowing past the last bucket.
    const bucketIndex = value === input.max
      ? input.bucketCount - 1
      : clamp(Math.floor((value - input.min) / bucketSize), 0, input.bucketCount - 1);

    counts[bucketIndex] += 1;
  });

  return counts.map((count, index) => {
    const min = input.min + bucketSize * index;
    const max = index === input.bucketCount - 1 ? input.max : min + bucketSize;

    return {
      label: input.labelFormatter({ min, max, index }),
      value: count,
    };
  });
}

function normalizeNumericData(data: readonly unknown[]): number[] {
  return data.filter((value): value is number => typeof value === "number" && Number.isFinite(value));
}

function normalizeDimension(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value));
}

function normalizeBucketCount(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.floor(value));
}

function finiteOrDefault(value: number | undefined, fallback: number): number {
  return value !== undefined && Number.isFinite(value) ? value : fallback;
}

function normalizeDomain(min: number, max: number): [number, number] {
  if (min <= max) return [min, max];
  return [max, min];
}

function defaultLabelFormatter(range: HistogramBucketRange): string {
  if (range.min === range.max) return formatNumber(range.min);
  return `${formatNumber(range.min)}-${formatNumber(range.max)}`;
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function fallbackText(text: string, width: number, fg: ChartColor | undefined): DrawCommand[] {
  return [{ type: "text", x: 0, y: 0, text, maxWidth: width, fg }];
}
