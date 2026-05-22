import { createSparklineCommands, type DrawCommand, type RenderMode, type SparklineOptions } from "@opentui-charts/core";
import type { ChartRenderableOptions } from "./chart-renderable";
import { ChartRenderable } from "./chart-renderable";

/**
 * Constructor options for an OpenTUI sparkline renderable.
 */
export type SparklineRenderableOptions = ChartRenderableOptions<SparklineOptions>;

/**
 * OpenTUI renderable that displays a compact sparkline chart.
 */
export class SparklineRenderable extends ChartRenderable<SparklineOptions> {
  /**
   * Delegates sparkline geometry and glyph selection to the core package.
   */
  protected getCommands(options: SparklineOptions): DrawCommand[] {
    return createSparklineCommands(options);
  }

  /**
   * Replaces the sparkline input data and requests a render.
   */
  set data(value: readonly unknown[]) {
    this.setChartOption("data", value);
  }

  /**
   * Sets the sparkline rendering mode and requests a render.
   */
  set renderMode(value: RenderMode | undefined) {
    this.setChartOption("renderMode", value);
  }

  /**
   * Sets the lower value domain override and requests a render.
   */
  set min(value: number | undefined) {
    this.setChartOption("min", value);
  }

  /**
   * Sets the upper value domain override and requests a render.
   */
  set max(value: number | undefined) {
    this.setChartOption("max", value);
  }

  /**
   * Controls whether the latest value is shown and requests a render.
   */
  set showValue(value: boolean | undefined) {
    this.setChartOption("showValue", value);
  }

  /**
   * Sets the displayed value formatter and requests a render.
   */
  set valueFormatter(value: ((value: number) => string) | undefined) {
    this.setChartOption("valueFormatter", value);
  }
}
