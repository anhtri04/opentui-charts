import type { ChartBounds, ChartSize } from "../commands";
import { insetBounds, normalizeBounds } from "../geometry";
import { normalizePadding, type ChartPadding } from "./padding";

export type ChartLayout = {
  outerBounds: ChartBounds;
  plotBounds: ChartBounds;
  titleBounds?: ChartBounds;
  xAxisBounds?: ChartBounds;
  yAxisBounds?: ChartBounds;
  legendBounds?: ChartBounds;
};

export function createChartLayout(input: {
  size: ChartSize;
  padding?: Partial<ChartPadding>;
}): ChartLayout {
  const outerBounds = normalizeBounds({
    x: 0,
    y: 0,
    width: input.size.width,
    height: input.size.height,
  });

  const padding = normalizePadding(input.padding);

  return {
    outerBounds,
    plotBounds: insetBounds(outerBounds, padding),
  };
}
