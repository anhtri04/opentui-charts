import type { DrawCommand } from "@opentui-charts/core";
import { renderCommandsToFrameBuffer, type FrameBufferLike } from "@opentui-charts/opentui";
import type { ChartRenderTarget } from "./types";

export function renderToTarget(target: ChartRenderTarget | undefined, commands: readonly DrawCommand[]): void {
  if (!target) return;

  if (typeof target === "function") {
    target(commands);
    return;
  }

  renderCommandsToFrameBuffer(target as FrameBufferLike, commands);
}
