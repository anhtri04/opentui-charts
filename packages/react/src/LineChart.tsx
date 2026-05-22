import type { LineChartRenderableOptions } from "@opentui-charts/opentui";
import { createElement } from "react";
import { registerOpenTUICharts } from "./register";

/**
 * Props accepted by the React line chart binding.
 *
 * These options are passed through to the OpenTUI line chart renderable.
 */
export type LineChartProps = LineChartRenderableOptions;

/**
 * Thin React/OpenTUI wrapper for the line chart renderable.
 *
 * The component ensures the custom OpenTUI chart elements are registered before
 * creating the underlying `opentuiLineChart` element.
 */
export function LineChart(props: LineChartProps) {
  registerOpenTUICharts();
  return createElement("opentuiLineChart", props);
}
