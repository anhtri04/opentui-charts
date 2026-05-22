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

/**
 * Constructor options for an OpenTUI histogram renderable.
 */
export type HistogramRenderableOptions = ChartRenderableOptions<HistogramOptions>;

/**
 * OpenTUI renderable that displays a histogram.
 */
export class HistogramRenderable extends ChartRenderable<HistogramOptions> {
  /**
   * Delegates bucketing, orientation, and bar command generation to core.
   */
  protected getCommands(options: HistogramOptions): DrawCommand[] {
    return createHistogramCommands(options);
  }

  /**
   * Replaces the histogram input data and requests a render.
   */
  set data(value: readonly unknown[]) {
    this.setChartOption("data", value);
  }

  /**
   * Sets the requested bucket count and requests a render.
   */
  set buckets(value: number | undefined) {
    this.setChartOption("buckets", value);
  }

  /**
   * Sets the histogram orientation and requests a render.
   */
  set orientation(value: HistogramOrientation | undefined) {
    this.setChartOption("orientation", value);
  }

  /**
   * Sets the histogram rendering mode and requests a render.
   */
  set renderMode(value: RenderMode | undefined) {
    this.setChartOption("renderMode", value);
  }

  /**
   * Sets the lower bucket domain override and requests a render.
   */
  set min(value: number | undefined) {
    this.setChartOption("min", value);
  }

  /**
   * Sets the upper bucket domain override and requests a render.
   */
  set max(value: number | undefined) {
    this.setChartOption("max", value);
  }

  /**
   * Controls whether bucket counts are shown and requests a render.
   */
  set showValues(value: boolean | undefined) {
    this.setChartOption("showValues", value);
  }

  /**
   * Sets the displayed bucket-count formatter and requests a render.
   */
  set valueFormatter(value: ((count: number) => string) | undefined) {
    this.setChartOption("valueFormatter", value);
  }

  /**
   * Sets the displayed bucket-range formatter and requests a render.
   */
  set labelFormatter(value: ((range: HistogramBucketRange) => string) | undefined) {
    this.setChartOption("labelFormatter", value);
  }

  /**
   * Sets the label column width and requests a render.
   */
  set labelWidth(value: number | undefined) {
    this.setChartOption("labelWidth", value);
  }

  /**
   * Sets the bar fill character and requests a render.
   */
  set barChar(value: string | undefined) {
    this.setChartOption("barChar", value);
  }
}
