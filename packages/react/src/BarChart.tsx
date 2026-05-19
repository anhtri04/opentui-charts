import type { BarChartRenderableOptions } from "@opentui-charts/opentui";
import { createElement } from "react";
import { registerOpenTUICharts } from "./register";

export type BarChartProps = BarChartRenderableOptions;

export function BarChart(props: BarChartProps) {
  registerOpenTUICharts();
  return createElement("opentuiBarChart", props);
}
