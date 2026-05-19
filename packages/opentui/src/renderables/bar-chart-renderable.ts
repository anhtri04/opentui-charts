import { createBarChartCommands, type BarChartDatum, type BarChartOptions, type DrawCommand, type RenderMode } from "@opentui-charts/core";
import type { ChartRenderableOptions } from "./chart-renderable";
import { ChartRenderable } from "./chart-renderable";

export type BarChartRenderableOptions = ChartRenderableOptions<BarChartOptions>;

export class BarChartRenderable extends ChartRenderable<BarChartOptions> {
  protected getCommands(options: BarChartOptions): DrawCommand[] {
    return createBarChartCommands(options);
  }

  set data(value: readonly BarChartDatum[]) {
    this.setChartOption("data", value);
  }

  set renderMode(value: RenderMode | undefined) {
    this.setChartOption("renderMode", value);
  }

  set max(value: number | undefined) {
    this.setChartOption("max", value);
  }

  set showValues(value: boolean | undefined) {
    this.setChartOption("showValues", value);
  }

  set valueFormatter(value: ((value: number) => string) | undefined) {
    this.setChartOption("valueFormatter", value);
  }

  set labelWidth(value: number | undefined) {
    this.setChartOption("labelWidth", value);
  }

  set barChar(value: string | undefined) {
    this.setChartOption("barChar", value);
  }
}
