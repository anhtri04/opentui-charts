import type { SparklineRenderableOptions } from "@opentui-charts/opentui";
import { createElement } from "react";
import { registerOpenTUICharts } from "./register";

export type SparklineProps = SparklineRenderableOptions;

export function Sparkline(props: SparklineProps) {
  registerOpenTUICharts();
  return createElement("opentuiSparkline", props);
}
