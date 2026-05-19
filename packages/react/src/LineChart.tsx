import type { LineChartRenderableOptions } from "@opentui-charts/opentui";
import { createElement } from "react";
import { registerOpenTUICharts } from "./register";

export type LineChartProps = LineChartRenderableOptions;

export function LineChart(props: LineChartProps) {
  registerOpenTUICharts();
  return createElement("opentuiLineChart", props);
}
