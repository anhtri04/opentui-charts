import {
  createBarChartCommands,
  type BarChartDatum,
  type BarChartOptions,
  type DrawCommand,
  type RenderMode,
} from "@opentui-charts/core";
import type { ChartRenderableOptions } from "./chart-renderable";
import { ChartRenderable } from "./chart-renderable";

/**
 * Constructor options for an OpenTUI horizontal bar-chart renderable.
 */
export type BarChartRenderableOptions = ChartRenderableOptions<BarChartOptions>;

/**
 * OpenTUI renderable that displays a horizontal bar chart.
 */
export class BarChartRenderable extends ChartRenderable<BarChartOptions> {
  /**
   * Delegates bar layout and label generation to the core package.
   */
  protected getCommands(options: BarChartOptions): DrawCommand[] {
    return createBarChartCommands(options);
  }

  /**
   * Replaces the bar-chart input data and requests a render.
   */
  set data(value: readonly BarChartDatum[]) {
    this.setChartOption("data", value);
  }

  /**
   * Sets the bar rendering mode and requests a render.
   */
  set renderMode(value: RenderMode | undefined) {
    this.setChartOption("renderMode", value);
  }

  /**
   * Sets the maximum value override and requests a render.
   */
  set max(value: number | undefined) {
    this.setChartOption("max", value);
  }

  /**
   * Controls whether values are shown beside bars and requests a render.
   */
  set showValues(value: boolean | undefined) {
    this.setChartOption("showValues", value);
  }

  /**
   * Sets the displayed value formatter and requests a render.
   */
  set valueFormatter(value: ((value: number) => string) | undefined) {
    this.setChartOption("valueFormatter", value);
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
