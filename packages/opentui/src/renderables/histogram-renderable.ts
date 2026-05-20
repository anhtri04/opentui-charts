import {
  createHistogramCommands,
  type DrawCommand,
  type HistogramBucketRange,
  type HistogramOptions,
  type HistogramOrientation,
  type RenderMode,
} from "@opentui-charts/core";
import type { ChartRenderableOptions } from "./chart-renderable";
import { ChartRenderable } from "./chart-renderable";

export type HistogramRenderableOptions = ChartRenderableOptions<HistogramOptions>;

export class HistogramRenderable extends ChartRenderable<HistogramOptions> {
  protected getCommands(options: HistogramOptions): DrawCommand[] {
    return createHistogramCommands(options);
  }

  set data(value: readonly unknown[]) {
    this.setChartOption("data", value);
  }

  set buckets(value: number | undefined) {
    this.setChartOption("buckets", value);
  }

  set orientation(value: HistogramOrientation | undefined) {
    this.setChartOption("orientation", value);
  }

  set renderMode(value: RenderMode | undefined) {
    this.setChartOption("renderMode", value);
  }

  set min(value: number | undefined) {
    this.setChartOption("min", value);
  }

  set max(value: number | undefined) {
    this.setChartOption("max", value);
  }

  set showValues(value: boolean | undefined) {
    this.setChartOption("showValues", value);
  }

  set valueFormatter(value: ((count: number) => string) | undefined) {
    this.setChartOption("valueFormatter", value);
  }

  set labelFormatter(value: ((range: HistogramBucketRange) => string) | undefined) {
    this.setChartOption("labelFormatter", value);
  }

  set labelWidth(value: number | undefined) {
    this.setChartOption("labelWidth", value);
  }

  set barChar(value: string | undefined) {
    this.setChartOption("barChar", value);
  }
}
