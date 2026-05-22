import type { SparklineRenderableOptions } from "@opentui-charts/opentui";
import { createElement } from "react";
import { registerOpenTUICharts } from "./register";

/**
 * Props accepted by the React sparkline binding.
 *
 * These options are passed through to the OpenTUI sparkline renderable.
 */
export type SparklineProps = SparklineRenderableOptions;

/**
 * Thin React/OpenTUI wrapper for the sparkline renderable.
 *
 * The component ensures the custom OpenTUI chart elements are registered before
 * creating the underlying `opentuiSparkline` element.
 */
export function Sparkline(props: SparklineProps) {
  registerOpenTUICharts();
  return createElement("opentuiSparkline", props);
}
