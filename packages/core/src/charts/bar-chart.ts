import type { ChartColor, DrawCommand, RenderMode } from "../commands";
import { clamp } from "../geometry";

/**
 * A single horizontal bar chart row.
 *
 * `label` is clipped to the computed or requested label column width. `value`
 * must be finite and non-negative to be rendered; invalid, non-finite, and
 * negative values are filtered out.
 */
export type BarChartDatum = {
  label: string;
  value: number;
};

/**
 * Options for creating horizontal bar chart draw commands.
 *
 * `width` and `height` are floored to non-negative integer cell dimensions; zero,
 * negative, or non-finite dimensions render no commands. `height` defaults to the
 * input data length and limits the number of rendered rows. Very narrow charts
 * render clipped fallback text, and empty normalized data renders clipped
 * `No data` fallback text.
 *
 * `renderMode` defaults to `"unicode"` and selects the default bar glyph unless
 * `barChar` is provided. Values are shown by default; `valueFormatter`, when
 * supplied, formats value text and owns units or localization. The value column is
 * right-aligned at the chart edge. `labelWidth` is clamped to leave room for chart
 * content; without it, labels use the longest label up to the default maximum and
 * available width.
 */
export type BarChartOptions = {
  data: readonly BarChartDatum[];
  width: number;
  height?: number;
  renderMode?: RenderMode;
  max?: number;
  showValues?: boolean;
  valueFormatter?: (value: number) => string;
  labelWidth?: number;
  barChar?: string;
  fg?: ChartColor;
};

const fallbackMinimumWidth = 4;
const defaultMaximumLabelWidth = 12;

/**
 * Creates pure draw commands for a horizontal bar chart.
 *
 * Rows with invalid labels or values are ignored, and only finite non-negative
 * values are rendered. Bars are scaled against a positive `max` option when
 * provided, otherwise against the largest normalized value. The default render
 * mode is `"unicode"`.
 */
export function createBarChartCommands(options: BarChartOptions): DrawCommand[] {
  const width = normalizeDimension(options.width);
  const height = normalizeDimension(options.height ?? options.data.length);

  if (width < 1 || height < 1) return [];
  if (width < fallbackMinimumWidth) return fallbackText("…", width, options.fg);

  const data = normalizeBarData(options.data).slice(0, height);
  if (data.length === 0) return fallbackText("No data", width, options.fg);

  const max = normalizeMax(options.max, data);
  const showValues = options.showValues ?? true;
  const formatter = options.valueFormatter ?? defaultValueFormatter;
  const renderMode = options.renderMode ?? "unicode";
  const barChar = options.barChar ?? (renderMode === "ascii" ? "#" : "█");
  const labelWidth = computeLabelWidth(data, width, options.labelWidth);
  const commands: DrawCommand[] = [];

  data.forEach((datum, y) => {
    const valueText = showValues ? formatter(datum.value) : "";
    const valueGap = valueText.length > 0 ? 1 : 0;
    const labelGap = labelWidth > 0 ? 1 : 0;
    const barStart = labelWidth + labelGap;
    // Reserve label, gaps, and optional right-aligned value text before scaling the row bar.
    const availableBarWidth = Math.max(0, width - barStart - valueGap - valueText.length);
    const barWidth = max <= 0 ? 0 : Math.round(clamp(datum.value / max, 0, 1) * availableBarWidth);

    if (labelWidth > 0) {
      commands.push({
        type: "text",
        x: 0,
        y,
        text: datum.label,
        maxWidth: labelWidth,
        fg: options.fg,
      });
    }

    if (barWidth > 0) {
      commands.push({
        type: "rect",
        x: barStart,
        y,
        width: barWidth,
        height: 1,
        char: barChar,
        fg: options.fg,
      });
    }

    if (valueText.length > 0) {
      commands.push({
        type: "text",
        x: width - valueText.length,
        y,
        text: valueText,
        maxWidth: valueText.length,
        fg: options.fg,
      });
    }
  });

  return commands;
}

function normalizeBarData(data: readonly BarChartDatum[]): BarChartDatum[] {
  return data
    .filter((datum) => typeof datum.label === "string" && typeof datum.value === "number" && Number.isFinite(datum.value))
    .filter((datum) => datum.value >= 0);
}

function normalizeMax(max: number | undefined, data: readonly BarChartDatum[]): number {
  if (max !== undefined && Number.isFinite(max) && max > 0) return max;
  return Math.max(0, ...data.map((datum) => datum.value));
}

function computeLabelWidth(data: readonly BarChartDatum[], chartWidth: number, requestedWidth: number | undefined): number {
  if (requestedWidth !== undefined && Number.isFinite(requestedWidth)) {
    return clamp(Math.floor(requestedWidth), 0, Math.max(0, chartWidth - 2));
  }

  const longestLabel = Math.max(0, ...data.map((datum) => Array.from(datum.label).length));
  return clamp(longestLabel, 0, Math.min(defaultMaximumLabelWidth, Math.max(0, chartWidth - 2)));
}

function normalizeDimension(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value));
}

function defaultValueFormatter(value: number): string {
  return String(value);
}

function fallbackText(text: string, width: number, fg: ChartColor | undefined): DrawCommand[] {
  return [{ type: "text", x: 0, y: 0, text, maxWidth: width, fg }];
}
