import type { DrawCommand } from "@opentui-charts/core";
import { renderCommandsToFrameBuffer, type FrameBufferLike } from "@opentui-charts/opentui";
import type { ChartRenderTarget } from "./types";

/**
 * Sends draw commands to a lower-level render target when one is provided.
 *
 * Function targets receive the commands directly; frame-buffer-like targets are
 * rendered through the OpenTUI adapter.
 */
export function renderToTarget(target: ChartRenderTarget | undefined, commands: readonly DrawCommand[]): void {
  if (!target) return;

  if (typeof target === "function") {
    target(commands);
    return;
  }

  renderCommandsToFrameBuffer(target as FrameBufferLike, commands);
}
