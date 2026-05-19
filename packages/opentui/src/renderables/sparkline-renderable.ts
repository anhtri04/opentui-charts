import { createSparklineCommands, type DrawCommand, type RenderMode, type SparklineOptions } from "@opentui-charts/core";
import type { ChartRenderableOptions } from "./chart-renderable";
import { ChartRenderable } from "./chart-renderable";

export type SparklineRenderableOptions = ChartRenderableOptions<SparklineOptions>;

export class SparklineRenderable extends ChartRenderable<SparklineOptions> {
  protected getCommands(options: SparklineOptions): DrawCommand[] {
    return createSparklineCommands(options);
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

  set showValue(value: boolean | undefined) {
    this.setChartOption("showValue", value);
  }

  set valueFormatter(value: ((value: number) => string) | undefined) {
    this.setChartOption("valueFormatter", value);
  }
}
