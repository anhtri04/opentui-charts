import type { ChartColor, DrawCommand, RenderMode } from "../commands";
import { clamp } from "../geometry";

export type BarChartDatum = {
  label: string;
  value: number;
};

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
