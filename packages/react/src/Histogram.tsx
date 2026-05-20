import type { HistogramRenderableOptions } from "@opentui-charts/opentui";
import { createElement } from "react";
import { registerOpenTUICharts } from "./register";

export type HistogramProps = HistogramRenderableOptions;

export function Histogram(props: HistogramProps) {
  registerOpenTUICharts();
  return createElement("opentuiHistogram", props);
}
