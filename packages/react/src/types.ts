import type { DrawCommand } from "@opentui-charts/core";
import type { FrameBufferLike } from "@opentui-charts/opentui";
import type { ReactNode } from "react";

/**
 * Lower-level target accepted by helpers that render or expose core draw commands.
 *
 * A target may be an OpenTUI-compatible frame buffer or a callback that receives
 * the generated command list.
 */
export type ChartRenderTarget = FrameBufferLike | ((commands: readonly DrawCommand[]) => void);

/**
 * Shared lower-level props for command-oriented React helpers.
 *
 * The current chart components are thin OpenTUI element wrappers and do not
 * implement these props directly.
 */
export type ChartComponentProps = {
  target?: ChartRenderTarget;
  onCommands?: (commands: readonly DrawCommand[]) => void;
  children?: (commands: readonly DrawCommand[]) => ReactNode;
};
