import type { HistogramRenderableOptions } from "@opentui-charts/opentui";
import { createElement } from "react";
import { registerOpenTUICharts } from "./register";

/**
 * Props accepted by the React histogram binding.
 *
 * These options are passed through to the OpenTUI histogram renderable.
 */
export type HistogramProps = HistogramRenderableOptions;

/**
 * Thin React/OpenTUI wrapper for the histogram renderable.
 *
 * The component ensures the custom OpenTUI chart elements are registered before
 * creating the underlying `opentuiHistogram` element.
 */
export function Histogram(props: HistogramProps) {
  registerOpenTUICharts();
  return createElement("opentuiHistogram", props);
}
