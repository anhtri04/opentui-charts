import type { ChartBounds } from "./commands";

export type Point = {
  x: number;
  y: number;
};

export function clamp(value: number, min: number, max: number): number {
  if (min > max) return clamp(value, max, min);
  return Math.min(max, Math.max(min, value));
}

export function containsPoint(bounds: ChartBounds, x: number, y: number): boolean {
  return (
    x >= bounds.x &&
    y >= bounds.y &&
    x < bounds.x + bounds.width &&
    y < bounds.y + bounds.height
  );
}

export function intersectsBounds(a: ChartBounds, b: ChartBounds): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function insetBounds(
  bounds: ChartBounds,
  padding: Partial<{ top: number; right: number; bottom: number; left: number }>,
): ChartBounds {
  const top = normalizeInset(padding.top);
  const right = normalizeInset(padding.right);
  const bottom = normalizeInset(padding.bottom);
  const left = normalizeInset(padding.left);

  return {
    x: bounds.x + left,
    y: bounds.y + top,
    width: Math.max(0, bounds.width - left - right),
    height: Math.max(0, bounds.height - top - bottom),
  };
}

export function normalizeBounds(bounds: ChartBounds): ChartBounds {
  return {
    x: Math.round(finiteOrZero(bounds.x)),
    y: Math.round(finiteOrZero(bounds.y)),
    width: Math.max(0, Math.floor(finiteOrZero(bounds.width))),
    height: Math.max(0, Math.floor(finiteOrZero(bounds.height))),
  };
}

function normalizeInset(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value));
}

function finiteOrZero(value: number): number {
  return Number.isFinite(value) ? value : 0;
}
