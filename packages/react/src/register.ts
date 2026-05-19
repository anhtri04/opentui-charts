import { extend } from "@opentui/react";
import { BarChartRenderable, SparklineRenderable } from "@opentui-charts/opentui";

let registered = false;

export function registerOpenTUICharts(): void {
  if (registered) return;
  extend({
    opentuiSparkline: SparklineRenderable,
    opentuiBarChart: BarChartRenderable,
  });
  registered = true;
}

declare module "@opentui/react" {
  interface OpenTUIComponents {
    opentuiSparkline: typeof SparklineRenderable;
    opentuiBarChart: typeof BarChartRenderable;
  }
}
