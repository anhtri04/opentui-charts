import { Renderable, type OptimizedBuffer, type RenderableOptions, type RenderContext } from "@opentui/core";
import type { ChartColor, DrawCommand } from "@opentui-charts/core";
import { createOpenTUIFrameBufferAdapter } from "../opentui-buffer-adapter";
import { renderCommandsToFrameBuffer } from "../render-commands-to-frame-buffer";

export type ChartRenderableOptions<TChartOptions> = RenderableOptions &
  Omit<TChartOptions, "width" | "height"> & {
    fg?: ChartColor;
    bg?: ChartColor;
  };

export abstract class ChartRenderable<TChartOptions extends { width: number; height?: number }> extends Renderable {
  protected chartOptions: Omit<TChartOptions, "width" | "height">;
  protected chartFg?: ChartColor;
  protected chartBg?: ChartColor;

  constructor(ctx: RenderContext, options: ChartRenderableOptions<TChartOptions>) {
    super(ctx, options);
    const { fg, bg, ...chartOptions } = options as ChartRenderableOptions<TChartOptions> & Record<string, unknown>;
    this.chartFg = typeof fg === "string" ? fg : undefined;
    this.chartBg = typeof bg === "string" ? bg : undefined;
    this.chartOptions = chartOptions as Omit<TChartOptions, "width" | "height">;
  }

  protected setChartOption<TKey extends keyof Omit<TChartOptions, "width" | "height">>(
    key: TKey,
    value: Omit<TChartOptions, "width" | "height">[TKey],
  ): void {
    this.chartOptions = { ...this.chartOptions, [key]: value };
    this.requestRender();
  }

  set fg(value: ChartColor | undefined) {
    this.chartFg = value;
    this.requestRender();
  }

  set bg(value: ChartColor | undefined) {
    this.chartBg = value;
    this.requestRender();
  }

  protected abstract getCommands(options: TChartOptions): DrawCommand[];

  protected renderSelf(buffer: OptimizedBuffer): void {
    const width = Math.max(0, Math.floor(this.width));
    const height = Math.max(0, Math.floor(this.height));
    if (width === 0 || height === 0) return;

    const commands = this.getCommands({
      ...(this.chartOptions as Omit<TChartOptions, "width" | "height">),
      width,
      height,
      fg: this.chartFg,
    } as unknown as TChartOptions);

    renderCommandsToFrameBuffer(
      createOpenTUIFrameBufferAdapter(buffer, {
        x: this.x,
        y: this.y,
        width,
        height,
        defaultFg: this.chartFg,
        defaultBg: this.chartBg,
      }),
      commands,
    );
  }
}
