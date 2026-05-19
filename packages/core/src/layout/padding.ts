export type ChartPadding = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export function normalizePadding(padding?: Partial<ChartPadding>): ChartPadding {
  return {
    top: normalizePaddingValue(padding?.top),
    right: normalizePaddingValue(padding?.right),
    bottom: normalizePaddingValue(padding?.bottom),
    left: normalizePaddingValue(padding?.left),
  };
}

function normalizePaddingValue(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value));
}
