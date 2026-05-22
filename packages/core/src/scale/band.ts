/**
 * Discrete domain value supported by band scales.
 */
export type BandDomainValue = string | number;

/**
 * Discrete scale that maps domain values to evenly spaced band starts.
 */
export type BandScale<T extends BandDomainValue = string> = {
  domain: readonly T[];
  range: [number, number];
  step: number;
  bandwidth: number;
  map(value: T): number | undefined;
};

/**
 * Creates a band scale for categorical or ordinal values.
 */
export function createBandScale<T extends BandDomainValue>(input: {
  domain: readonly T[];
  range: [number, number];
  paddingInner?: number;
}): BandScale<T> {
  const domain = [...input.domain];
  const [r0, r1] = input.range;
  const count = domain.length;
  const span = r1 - r0;
  const direction = span < 0 ? -1 : 1;
  const absoluteSpan = Math.abs(span);
  const paddingInner = normalizePadding(input.paddingInner);

  if (count === 0 || absoluteSpan === 0) {
    return {
      domain,
      range: input.range,
      step: 0,
      bandwidth: 0,
      map: () => undefined,
    };
  }

  // Inner padding is represented as extra step fractions between adjacent bands.
  const denominator = Math.max(1, count + paddingInner * Math.max(0, count - 1));
  const step = absoluteSpan / denominator;
  const bandwidth = step;

  const index = new Map<T, number>();
  domain.forEach((value, i) => index.set(value, i));

  return {
    domain,
    range: input.range,
    step: step * direction,
    bandwidth,

    map(value: T): number | undefined {
      const i = index.get(value);
      if (i === undefined) return undefined;
      return r0 + direction * i * step * (1 + paddingInner);
    },
  };
}

function normalizePadding(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value)) return 0;
  return Math.max(0, value);
}
