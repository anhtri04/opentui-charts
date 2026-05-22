import { createBarChartCommands, createLineChartCommands, createSparklineCommands, type BarChartOptions, type LineChartOptions, type SparklineOptions } from "@opentui-charts/core";
import { useMemo } from "react";

/**
 * Memoizes core sparkline command generation for React consumers.
 *
 * The hook remains a thin wrapper over `createSparklineCommands`; callers should
 * pass stable object/array/function references when they want memoization to be
 * effective.
 */
export function useSparklineCommands(options: SparklineOptions) {
  return useMemo(
    () => createSparklineCommands(options),
    // Keep this explicit so nested option changes used by the core generator are tracked.
    [options.data, options.width, options.height, options.renderMode, options.min, options.max, options.showValue, options.valueFormatter, options.fg],
  );
}

/**
 * Memoizes core bar chart command generation for React consumers.
 *
 * The hook remains a thin wrapper over `createBarChartCommands`; callers should
 * pass stable object/array/function references when they want memoization to be
 * effective.
 */
export function useBarChartCommands(options: BarChartOptions) {
  return useMemo(
    () => createBarChartCommands(options),
    // Keep this explicit so nested option changes used by the core generator are tracked.
    [
      options.data,
      options.width,
      options.height,
      options.renderMode,
      options.max,
      options.showValues,
      options.valueFormatter,
      options.labelWidth,
      options.barChar,
      options.fg,
    ],
  );
}

/**
 * Memoizes core line chart command generation for React consumers.
 *
 * The hook remains a thin wrapper over `createLineChartCommands`; callers should
 * pass stable object/array/function references when they want memoization to be
 * effective.
 */
export function useLineChartCommands(options: LineChartOptions) {
  return useMemo(
    () => createLineChartCommands(options),
    // Keep this explicit so nested option changes used by the core generator are tracked.
    [
      options.data,
      options.width,
      options.height,
      options.renderMode,
      options.min,
      options.max,
      options.showAxis,
      options.showXAxis,
      options.showYAxis,
      options.showGrid,
      options.valueFormatter,
      options.fg,
      options.axisColor,
      options.gridColor,
      options.lineChar,
    ],
  );
}
