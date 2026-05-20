import { extend } from "@opentui/react";
import { BarChartRenderable, HistogramRenderable, LineChartRenderable, SparklineRenderable } from "@opentui-charts/opentui";

let registered = false;

export function registerOpenTUICharts(): void {
  if (registered) return;
  extend({
    opentuiSparkline: SparklineRenderable,
    opentuiBarChart: BarChartRenderable,
    opentuiLineChart: LineChartRenderable,
    opentuiHistogram: HistogramRenderable,
  });
  registered = true;
}

declare module "@opentui/react" {
  interface OpenTUIComponents {
    opentuiSparkline: typeof SparklineRenderable;
    opentuiBarChart: typeof BarChartRenderable;
    opentuiLineChart: typeof LineChartRenderable;
    opentuiHistogram: typeof HistogramRenderable;
  }
}
