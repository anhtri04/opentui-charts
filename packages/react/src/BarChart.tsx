import type { BarChartRenderableOptions } from "@opentui-charts/opentui";
import { createElement } from "react";
import { registerOpenTUICharts } from "./register";

/**
 * Props accepted by the React bar chart binding.
 *
 * These options are passed through to the OpenTUI bar chart renderable.
 */
export type BarChartProps = BarChartRenderableOptions;

/**
 * Thin React/OpenTUI wrapper for the bar chart renderable.
 *
 * The component ensures the custom OpenTUI chart elements are registered before
 * creating the underlying `opentuiBarChart` element.
 */
export function BarChart(props: BarChartProps) {
  registerOpenTUICharts();
  return createElement("opentuiBarChart", props);
}
