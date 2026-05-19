# Adding a New Chart or Graph

This guide describes the expected workflow for adding a new chart type to `opentui-charts`.

The short version:

```txt
packages/core      pure chart command generator + tests
packages/opentui   OpenTUI renderable/adapter integration
packages/react     React component wrapper
examples/          optional manual demo usage
```

## 1. Start in `packages/core`

Every chart should begin as a pure function that returns `DrawCommand[]`.

Example file:

```txt
packages/core/src/charts/line-chart.ts
```

Recommended API shape:

```ts
import type { ChartColor, DrawCommand, RenderMode } from "../commands";

export type LineChartOptions = {
  data: readonly number[];
  width: number;
  height: number;
  renderMode?: RenderMode;
  min?: number;
  max?: number;
  fg?: ChartColor;
};

export function createLineChartCommands(options: LineChartOptions): DrawCommand[] {
  // Normalize input.
  // Compute chart geometry.
  // Return draw commands.
  return [];
}
```

Core chart code must not import OpenTUI, React, terminal IO, filesystem APIs, process APIs, or app-specific code.

Good core behavior:

```ts
return [{ type: "cell", x: 0, y: 0, char: "█", fg: options.fg }];
```

Avoid in `packages/core`:

```ts
console.log(...);
process.exit(...);
buffer.setCell(...);
import { Renderable } from "@opentui/core";
import React from "react";
```

## 2. Normalize and validate input early

Chart functions should gracefully handle ordinary invalid input.

Required behavior:

- Normalize dimensions with finite checks, `Math.floor`, and non-negative clamping.
- Return `[]` for zero width or zero height.
- Use `Number.isFinite` for numeric validation.
- Filter invalid data where possible.
- Handle `NaN`, `Infinity`, empty data, invalid dimensions, tiny dimensions, and equal domains.
- Prefer fallback draw commands over throwing.

Common fallback examples:

```txt
No data
Invalid data
Chart too small
```

Use clipped text for fallbacks:

```ts
return [{ type: "text", x: 0, y: 0, text: "No data", maxWidth: width, fg }];
```

## 3. Keep rendering terminal-native

Terminal charts should use the existing draw command vocabulary:

- `cell`
- `text`
- `rect`
- `line`

Coordinate rules:

- `x` increases left to right.
- `y` increases top to bottom.
- Use integer cell coordinates when possible.
- If fractional coordinates are useful internally, make renderer rounding deterministic.
- Command order is paint order; later commands overwrite earlier cells.

Default rendering should be Unicode unless ASCII compatibility is requested:

```ts
renderMode: "ascii" | "unicode"
```

Only expose render modes that are implemented and tested. Do not expose Braille mode until it is fully implemented and snapshot-tested.

## 4. Keep the public API small

Prefer a minimal stable API first. Add options only when there is a clear generic charting need.

Good initial options:

```ts
{
  data,
  width,
  height,
  renderMode,
  min,
  max,
  fg,
}
```

Avoid app-specific options:

```ts
apiLatencyThreshold
httpStatusMode
currencySymbolPreset
```

Custom formatters should own units and localization:

```ts
valueFormatter?: (value: number) => string;
```

Do not hardcode units such as `ms`, `%`, or `$` in generic chart code.

## 5. Add core tests

Add tests under:

```txt
packages/core/test/<chart-name>.test.ts
```

Use `renderCommandsToString` for readable exact assertions.

Test checklist:

- Normal Unicode rendering.
- ASCII rendering, if the chart supports ASCII mode.
- Empty data.
- Invalid values such as `NaN` and `Infinity`.
- Zero width and zero height.
- Tiny dimensions.
- Equal min/max domains.
- Clipping behavior.
- Value/label formatting, if supported.

Example pattern:

```ts
import { describe, expect, it } from "vitest";
import { createLineChartCommands } from "../src/charts/line-chart";
import { renderCommandsToString } from "../src/render-commands-to-string";

function render(options: Parameters<typeof createLineChartCommands>[0]): string {
  return renderCommandsToString(createLineChartCommands(options), {
    width: Math.max(0, Math.floor(options.width)),
    height: Math.max(0, Math.floor(options.height)),
  });
}

describe("createLineChartCommands", () => {
  it("renders a unicode line chart", () => {
    expect(render({ data: [1, 2, 3], width: 3, height: 3 })).toBe("...");
  });
});
```

## 6. Export the core API

Update:

```txt
packages/core/src/index.ts
```

Add:

```ts
export * from "./charts/line-chart";
```

Keep exports intentional. Avoid exporting internal helpers unless they are part of the stable public API.

## 7. Add the OpenTUI renderable

Create a renderable in:

```txt
packages/opentui/src/renderables/line-chart-renderable.ts
```

Pattern:

```ts
import {
  createLineChartCommands,
  type DrawCommand,
  type LineChartOptions,
  type RenderMode,
} from "@opentui-charts/core";
import type { ChartRenderableOptions } from "./chart-renderable";
import { ChartRenderable } from "./chart-renderable";

export type LineChartRenderableOptions = ChartRenderableOptions<LineChartOptions>;

export class LineChartRenderable extends ChartRenderable<LineChartOptions> {
  protected getCommands(options: LineChartOptions): DrawCommand[] {
    return createLineChartCommands(options);
  }

  set data(value: readonly number[]) {
    this.setChartOption("data", value);
  }

  set renderMode(value: RenderMode | undefined) {
    this.setChartOption("renderMode", value);
  }
}
```

Then export it from:

```txt
packages/opentui/src/index.ts
```

The OpenTUI layer should translate core commands to OpenTUI buffers. It should not duplicate or reinterpret chart geometry.

## 8. Add the React component

Create:

```txt
packages/react/src/LineChart.tsx
```

Pattern:

```tsx
import type { LineChartRenderableOptions } from "@opentui-charts/opentui";
import { createElement } from "react";
import { registerOpenTUICharts } from "./register";

export type LineChartProps = LineChartRenderableOptions;

export function LineChart(props: LineChartProps) {
  registerOpenTUICharts();
  return createElement("opentuiLineChart", props);
}
```

Update:

```txt
packages/react/src/register.ts
packages/react/src/index.ts
```

Register the renderable with `extend` and export the React component.

The React package should stay a thin binding over OpenTUI renderables. Do not move chart algorithms into React components.

## 9. Add optional example usage

If useful for manual verification, add the chart to:

```txt
examples/basic-dashboard/src/index.tsx
```

Keep examples generic and reusable. Avoid making the chart API depend on the example's domain.

## 10. Validate the change

Prefer running the full suite before finishing broad chart additions:

```bash
npm run typecheck
npm test
npm run build
```

For focused work:

```bash
npm test -w @opentui-charts/core
npm run typecheck -w @opentui-charts/core
npm run typecheck -w @opentui-charts/opentui
npm run typecheck -w @opentui-charts/react
```

## Final checklist

- [ ] Core chart command generator added.
- [ ] Core function is pure and deterministic.
- [ ] Invalid input and tiny dimensions handled gracefully.
- [ ] Core tests added.
- [ ] Core exports updated.
- [ ] OpenTUI renderable added and exported.
- [ ] React component added, registered, and exported.
- [ ] Example usage added if helpful.
- [ ] Typecheck, tests, and build pass.
