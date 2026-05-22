import { createLineChartCommands, type DrawCommand, type LineChartOptions, type RenderMode } from "@opentui-charts/core";
import type { ChartRenderableOptions } from "./chart-renderable";
import { ChartRenderable } from "./chart-renderable";

/**
 * Constructor options for an OpenTUI line-chart renderable.
 */
export type LineChartRenderableOptions = ChartRenderableOptions<LineChartOptions>;

/**
 * OpenTUI renderable that displays a line chart.
 */
export class LineChartRenderable extends ChartRenderable<LineChartOptions> {
  /**
   * Delegates line plotting, axes, and grid command generation to core.
   */
  protected getCommands(options: LineChartOptions): DrawCommand[] {
    return createLineChartCommands(options);
  }

  /**
   * Replaces the line-chart input data and requests a render.
   */
  set data(value: readonly unknown[]) {
    this.setChartOption("data", value);
  }

  /**
   * Sets the line rendering mode and requests a render.
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
   * Controls whether chart axes are shown and requests a render.
   */
  set showAxis(value: boolean | undefined) {
    this.setChartOption("showAxis", value);
  }

  /**
   * Controls whether the x-axis is shown and requests a render.
   */
  set showXAxis(value: boolean | undefined) {
    this.setChartOption("showXAxis", value);
  }

  /**
   * Controls whether the y-axis is shown and requests a render.
   */
  set showYAxis(value: boolean | undefined) {
    this.setChartOption("showYAxis", value);
  }

  /**
   * Controls whether grid lines are shown and requests a render.
   */
  set showGrid(value: boolean | undefined) {
    this.setChartOption("showGrid", value);
  }

  /**
   * Sets the displayed value formatter and requests a render.
   */
  set valueFormatter(value: ((value: number) => string) | undefined) {
    this.setChartOption("valueFormatter", value);
  }

  /**
   * Sets the axis color and requests a render.
   */
  set axisColor(value: string | undefined) {
    this.setChartOption("axisColor", value);
  }

  /**
   * Sets the grid color and requests a render.
   */
  set gridColor(value: string | undefined) {
    this.setChartOption("gridColor", value);
  }

  /**
   * Sets the line drawing character and requests a render.
   */
  set lineChar(value: string | undefined) {
    this.setChartOption("lineChar", value);
  }
}
