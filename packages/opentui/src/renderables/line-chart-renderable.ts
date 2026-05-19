import { createLineChartCommands, type DrawCommand, type LineChartOptions, type RenderMode } from "@opentui-charts/core";
import type { ChartRenderableOptions } from "./chart-renderable";
import { ChartRenderable } from "./chart-renderable";

export type LineChartRenderableOptions = ChartRenderableOptions<LineChartOptions>;

export class LineChartRenderable extends ChartRenderable<LineChartOptions> {
  protected getCommands(options: LineChartOptions): DrawCommand[] {
    return createLineChartCommands(options);
  }

  set data(value: readonly unknown[]) {
    this.setChartOption("data", value);
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

  set showAxis(value: boolean | undefined) {
    this.setChartOption("showAxis", value);
  }

  set showXAxis(value: boolean | undefined) {
    this.setChartOption("showXAxis", value);
  }

  set showYAxis(value: boolean | undefined) {
    this.setChartOption("showYAxis", value);
  }

  set showGrid(value: boolean | undefined) {
    this.setChartOption("showGrid", value);
  }

  set valueFormatter(value: ((value: number) => string) | undefined) {
    this.setChartOption("valueFormatter", value);
  }

  set axisColor(value: string | undefined) {
    this.setChartOption("axisColor", value);
  }

  set gridColor(value: string | undefined) {
    this.setChartOption("gridColor", value);
  }

  set lineChar(value: string | undefined) {
    this.setChartOption("lineChar", value);
  }
}
