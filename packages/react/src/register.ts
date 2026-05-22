import { extend } from "@opentui/react";
import { BarChartRenderable, HistogramRenderable, LineChartRenderable, SparklineRenderable } from "@opentui-charts/opentui";

let registered = false;

/**
 * Registers the OpenTUI chart renderables used by this React package.
 *
 * Registration is idempotent, so React chart components can safely call this
 * before creating their underlying OpenTUI elements.
 */
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

// Teach @opentui/react about the custom element names registered above.
declare module "@opentui/react" {
  interface OpenTUIComponents {
    opentuiSparkline: typeof SparklineRenderable;
    opentuiBarChart: typeof BarChartRenderable;
    opentuiLineChart: typeof LineChartRenderable;
    opentuiHistogram: typeof HistogramRenderable;
  }
}
