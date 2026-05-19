import { clamp as clampValue } from "../geometry";

export type LinearScale = {
  domain: [number, number];
  range: [number, number];
  map(value: number): number;
  invert(value: number): number;
};

export function createLinearScale(input: {
  domain: [number, number];
  range: [number, number];
  clamp?: boolean;
}): LinearScale {
  let [d0, d1] = input.domain;
  const [r0, r1] = input.range;

  d0 = Number.isFinite(d0) ? d0 : 0;
  d1 = Number.isFinite(d1) ? d1 : 1;

  if (d0 === d1) {
    d0 -= 0.5;
    d1 += 0.5;
  }

  const domainSpan = d1 - d0;
  const rangeSpan = r1 - r0;

  const maybeClampRange = (value: number): number => {
    if (!input.clamp) return value;
    return clampValue(value, Math.min(r0, r1), Math.max(r0, r1));
  };

  return {
    domain: [d0, d1],
    range: [r0, r1],

    map(value: number): number {
      if (!Number.isFinite(value)) return maybeClampRange(r0);
      const t = (value - d0) / domainSpan;
      return maybeClampRange(r0 + t * rangeSpan);
    },

    invert(value: number): number {
      if (!Number.isFinite(value)) return d0;
      if (rangeSpan === 0) return d0;
      const t = (value - r0) / rangeSpan;
      return d0 + t * domainSpan;
    },
  };
}
