import { Renderable, type OptimizedBuffer, type RenderableOptions, type RenderContext } from "@opentui/core";
import type { ChartColor, DrawCommand } from "@opentui-charts/core";
import { createOpenTUIFrameBufferAdapter } from "../opentui-buffer-adapter";
import { renderCommandsToFrameBuffer } from "../render-commands-to-frame-buffer";

/**
 * Shared options accepted by OpenTUI chart renderables.
 *
 * OpenTUI owns the renderable dimensions, so chart `width` and `height` are
 * omitted from the public constructor options and supplied during rendering.
 * `fg` and `bg` provide default chart colors for draw commands that do not set
 * their own foreground or background.
 */
export type ChartRenderableOptions<TChartOptions> = RenderableOptions &
  Omit<TChartOptions, "width" | "height"> & {
    fg?: ChartColor;
    bg?: ChartColor;
  };

/**
 * Base OpenTUI renderable for charts backed by core draw commands.
 *
 * Lifecycle: the constructor stores chart-specific options, property setters
 * update those options and request a render, and `renderSelf` computes current
 * integer bounds before translating commands into the OpenTUI buffer. Subclasses
 * are responsible only for implementing `getCommands` by calling the matching
 * core chart command factory; they should keep geometry and rendering logic in
 * core rather than in the OpenTUI layer.
 */
export abstract class ChartRenderable<TChartOptions extends { width: number; height?: number }> extends Renderable {
  protected chartOptions: Omit<TChartOptions, "width" | "height">;
  protected chartFg?: ChartColor;
  protected chartBg?: ChartColor;

  /**
   * Creates a chart renderable and separates OpenTUI options from chart options.
   */
  constructor(ctx: RenderContext, options: ChartRenderableOptions<TChartOptions>) {
    super(ctx, options);
    const { fg, bg, ...chartOptions } = options as ChartRenderableOptions<TChartOptions> & Record<string, unknown>;
    this.chartFg = typeof fg === "string" ? fg : undefined;
    this.chartBg = typeof bg === "string" ? bg : undefined;
    this.chartOptions = chartOptions as Omit<TChartOptions, "width" | "height">;
  }

  /**
   * Updates a chart option and schedules the renderable to be painted again.
   */
  protected setChartOption<TKey extends keyof Omit<TChartOptions, "width" | "height">>(
    key: TKey,
    value: Omit<TChartOptions, "width" | "height">[TKey],
  ): void {
    this.chartOptions = { ...this.chartOptions, [key]: value };
    this.requestRender();
  }

  /**
   * Sets the default foreground color for chart draw commands.
   */
  set fg(value: ChartColor | undefined) {
    this.chartFg = value;
    this.requestRender();
  }

  /**
   * Sets the default background color for chart draw commands.
   */
  set bg(value: ChartColor | undefined) {
    this.chartBg = value;
    this.requestRender();
  }

  /**
   * Creates core draw commands for the concrete chart implementation.
   */
  protected abstract getCommands(options: TChartOptions): DrawCommand[];

  /**
   * Renders the chart into OpenTUI by adapting core draw commands to cells.
   */
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
