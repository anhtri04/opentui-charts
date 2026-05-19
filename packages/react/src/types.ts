import type { DrawCommand } from "@opentui-charts/core";
import type { FrameBufferLike } from "@opentui-charts/opentui";
import type { ReactNode } from "react";

export type ChartRenderTarget = FrameBufferLike | ((commands: readonly DrawCommand[]) => void);

export type ChartComponentProps = {
  target?: ChartRenderTarget;
  onCommands?: (commands: readonly DrawCommand[]) => void;
  children?: (commands: readonly DrawCommand[]) => ReactNode;
};
