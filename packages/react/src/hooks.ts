import { createBarChartCommands, createSparklineCommands, type BarChartOptions, type SparklineOptions } from "@opentui-charts/core";
import { useMemo } from "react";

export function useSparklineCommands(options: SparklineOptions) {
  return useMemo(
    () => createSparklineCommands(options),
    [options.data, options.width, options.height, options.renderMode, options.min, options.max, options.showValue, options.valueFormatter, options.fg],
  );
}

export function useBarChartCommands(options: BarChartOptions) {
  return useMemo(
    () => createBarChartCommands(options),
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
