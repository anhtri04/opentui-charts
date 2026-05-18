# OpenTUI Charts Library Design Document

## 1. Vision

The goal of this project is to build a stable, reusable charting and graphing library for the OpenTUI ecosystem.

The library should not be designed as a one-off feature for a single application. It should be designed as an ecosystem-level package that any OpenTUI application can use to render charts, graphs, dashboards, metrics panels, logs, analytics views, benchmark results, monitoring screens, and other data-oriented terminal interfaces.

The library should feel native to OpenTUI: fast, terminal-friendly, layout-aware, keyboard-friendly, theme-aware, and composable.

A good mental model:

> This library should become the terminal charting layer for OpenTUI, similar in spirit to how Recharts, Chart.js, or D3 serve graphical UI ecosystems — but adapted to terminal constraints and OpenTUI's rendering model.

## 2. Project Name

Possible package names:

- `opentui-charts`
- `@opentui/charts`
- `@opentui-charts/core`
- `@opentui-charts/react`
- `@opentui-charts/solid`
- `@opentui-charts/opentui`

Recommended initial naming:

```txt
@opentui-charts/core
@opentui-charts/opentui
@opentui-charts/react
```

Later, if the OpenTUI ecosystem grows and the package is accepted as a common ecosystem package, it may be possible to align with official OpenTUI package naming.

## 3. Core Principles

### 3.1 Ecosystem-first

The library should be generic and reusable. It should not expose concepts specific to API testing, observability, finance, or any one domain.

Domain-specific packages can be built on top later.

Example:

```txt
Good: LineChart, BarChart, Histogram, Sparkline
Avoid: ApiLatencyChart, StatusCodeChart, RequestBenchmarkChart
```

Application-specific charts can be wrappers around generic primitives.

### 3.2 Stable public API

The library should be designed carefully from the start to avoid breaking changes.

Early versions should prefer small, composable APIs over large, over-configurable APIs.

The public API should be:

- predictable
- strongly typed
- framework-friendly
- easy to test
- easy to document
- hard to misuse

### 3.3 Terminal-native design

Terminal charts are not browser charts. The library should not blindly copy browser charting APIs.

Terminal rendering has different constraints:

- limited resolution
- monospace grid
- terminal color limitations
- Unicode compatibility issues
- variable terminal size
- keyboard-first interaction
- no mouse guarantee
- less space for labels and legends
- performance sensitivity during frequent redraws

The library should embrace these constraints instead of fighting them.

### 3.4 Layered architecture

Rendering logic should be separated from OpenTUI-specific integration.

The core chart engine should know how to compute scales, axes, layout, and drawing commands. The OpenTUI adapter should know how to draw those commands into OpenTUI's rendering primitives.

This separation makes the library easier to test, easier to maintain, and easier to support across multiple bindings.

### 3.5 Graceful degradation

Charts should work in different terminal environments.

The library should support multiple rendering modes:

```ts
renderMode: "ascii" | "unicode" | "braille"
```

- `ascii`: maximum compatibility
- `unicode`: good default visual quality
- `braille`: high-density plotting for line/scatter-style charts

Users should be able to choose compatibility over visual quality when needed.

## 4. Target Users

This library should serve several groups:

### 4.1 OpenTUI application developers

Developers building dashboards, developer tools, monitoring tools, API clients, database clients, Git tools, test runners, build tools, deployment tools, and local admin panels.

### 4.2 CLI/TUI tool authors

Developers who want better visual data presentation without leaving the terminal.

### 4.3 Data-heavy terminal applications

Applications that need to show trends, distributions, counts, comparisons, history, and real-time metrics.

### 4.4 Framework binding authors

Developers who may want React, Solid, or future OpenTUI framework bindings.

## 5. Non-goals

The first versions should not try to become a full replacement for browser charting libraries.

Non-goals for v0.x:

- 3D charts
- complex map visualizations
- advanced statistical plotting
- full D3-like grammar of graphics
- canvas-like arbitrary drawing API for users
- highly animated charts
- pixel-perfect graphical rendering
- complex mouse interactions
- full accessibility model equivalent to browser charts
- huge chart type catalog

The library should start small, stable, and useful.

## 6. High-level Architecture

Recommended package architecture:

```txt
@opentui-charts/core
  Pure chart computation and draw-command generation.

@opentui-charts/opentui
  Adapter that renders core draw commands into OpenTUI primitives.

@opentui-charts/react
  React components built on top of the OpenTUI adapter.

@opentui-charts/solid
  Future Solid components built on top of the OpenTUI adapter.
```

The most important design decision is that `core` should not depend on React, Solid, or application-specific state.

## 7. Package Responsibilities

### 7.1 `@opentui-charts/core`

Responsible for:

- chart layout calculation
- data normalization
- scale calculation
- axis generation
- tick generation
- label formatting
- clipping
- chart command generation
- render mode abstraction
- color/theme token abstraction
- chart-specific algorithms

Should export:

```ts
export type ChartSize = {
  width: number;
  height: number;
};

export type ChartBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type DrawCommand =
  | CellCommand
  | TextCommand
  | RectCommand
  | LineCommand;

export type RenderMode = "ascii" | "unicode" | "braille";
```

Should avoid:

- direct OpenTUI imports
- React imports
- terminal IO
- process-level side effects
- global mutable state

### 7.2 `@opentui-charts/opentui`

Responsible for:

- mapping draw commands to OpenTUI rendering primitives
- integrating with OpenTUI layout
- handling repaint lifecycle
- handling resize lifecycle
- handling focus/interaction lifecycle if needed
- exposing lower-level OpenTUI chart renderables

Should export:

```ts
export function renderCommandsToFrameBuffer(
  frameBuffer: FrameBufferLike,
  commands: DrawCommand[]
): void;
```

Potential exports:

```ts
export class LineChartRenderable {}
export class BarChartRenderable {}
export class SparklineRenderable {}
export class HistogramRenderable {}
```

### 7.3 `@opentui-charts/react`

Responsible for:

- user-friendly React component API
- prop normalization
- integration with OpenTUI React rendering
- composition with OpenTUI layout components

Example API:

```tsx
<LineChart
  data={data}
  xKey="time"
  yKey="value"
  width={60}
  height={12}
  showAxis
/>
```

### 7.4 `@opentui-charts/solid`

Future package with equivalent Solid bindings.

This should not be built until the core and OpenTUI adapter APIs are stable enough.

## 8. Internal Rendering Model

The core library should produce a list of drawing commands.

Example:

```ts
type DrawCommand =
  | {
      type: "cell";
      x: number;
      y: number;
      char: string;
      fg?: string;
      bg?: string;
    }
  | {
      type: "text";
      x: number;
      y: number;
      text: string;
      fg?: string;
      bg?: string;
      maxWidth?: number;
    }
  | {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
      char?: string;
      fg?: string;
      bg?: string;
    };
```

This is the boundary between chart logic and terminal rendering.

The command model allows:

- pure unit testing
- snapshot testing
- support for multiple rendering targets
- future export to string output
- future support for non-OpenTUI terminal renderers

## 9. Coordinate System

Use a simple terminal-grid coordinate system:

```txt
x: left to right
y: top to bottom
origin: top-left
```

Example:

```txt
(0,0) ───────────────► x
  │
  │
  │
  ▼
  y
```

All chart algorithms should operate on integer terminal-cell coordinates.

For high-resolution rendering, such as Braille charts, the logical data resolution can be higher than terminal cell resolution, but the final output should still become terminal cells.

## 10. Data Model

The library should support simple and structured data.

### 10.1 Simple numeric data

```ts
<Sparkline data={[10, 20, 15, 40, 30]} />
```

### 10.2 Object data with keys

```ts
<LineChart
  data={[
    { time: "10:00", latency: 120 },
    { time: "10:01", latency: 90 },
    { time: "10:02", latency: 150 },
  ]}
  xKey="time"
  yKey="latency"
/>
```

### 10.3 Series data

For multi-series charts:

```ts
type Series<T> = {
  name: string;
  data: T[];
  xKey?: keyof T;
  yKey?: keyof T;
};
```

Example:

```tsx
<LineChart
  series={[
    { name: "p50", data: p50Data, xKey: "time", yKey: "value" },
    { name: "p95", data: p95Data, xKey: "time", yKey: "value" },
  ]}
/>
```

Multi-series support should not be part of the earliest MVP unless the base API is ready for it.

## 11. Chart Configuration

Common props/options should be shared across chart types.

```ts
type BaseChartOptions = {
  width?: number;
  height?: number;
  title?: string;
  renderMode?: RenderMode;
  theme?: ChartTheme;
  min?: number;
  max?: number;
  showAxis?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  showLegend?: boolean;
  showGrid?: boolean;
  padding?: Partial<ChartPadding>;
  valueFormatter?: (value: number) => string;
  labelFormatter?: (label: string | number) => string;
};
```

Avoid exposing too many options too early. Start with a small stable surface and expand gradually.

## 12. Scaling

Scaling is one of the most important parts of the library.

The core should provide scale helpers:

```ts
type LinearScale = {
  domain: [number, number];
  range: [number, number];
  map(value: number): number;
  invert(value: number): number;
};
```

Initial scales:

- linear scale
- band scale for categorical bars
- time-like scale through numeric timestamp mapping

Later scales:

- logarithmic scale
- symmetric log scale
- percent scale

Important cases to handle:

- empty data
- one-point data
- all values equal
- negative values
- mixed negative and positive values
- very large values
- very small decimal values
- `NaN`, `Infinity`, `null`, `undefined`
- outliers

## 13. Axis and Ticks

Axis rendering should be optional.

Terminal charts often have very limited space, so defaults should be conservative.

Suggested defaults:

```ts
showAxis: false for Sparkline
showAxis: true for LineChart
showAxis: true for BarChart
showAxis: true for Histogram
```

Axis generation should support:

- min/max labels
- compact tick labels
- smart decimal formatting
- custom formatters
- clipping long labels

Example y-axis:

```txt
150 ┤      ╭╮
120 ┤   ╭──╯╰╮
 90 ┤╭──╯    ╰─
    └──────────
```

## 14. Themes

The library should support a small theme abstraction.

```ts
type ChartTheme = {
  foreground?: string;
  background?: string;
  axis?: string;
  grid?: string;
  series?: string[];
  text?: string;
  muted?: string;
  positive?: string;
  negative?: string;
  warning?: string;
  danger?: string;
};
```

Themes should be optional.

Default behavior should work without the user configuring a theme.

Possible built-in themes:

```ts
builtinThemes.default
builtinThemes.monochrome
builtinThemes.highContrast
builtinThemes.light
builtinThemes.dark
```

The OpenTUI adapter may later map OpenTUI theme information into chart themes.

## 15. Rendering Modes

### 15.1 ASCII mode

Maximum compatibility.

Characters:

```txt
- | + * # =
```

Useful for:

- old terminals
- CI logs
- SSH environments
- plain text output

### 15.2 Unicode mode

Recommended default.

Characters:

```txt
─ │ ┌ ┐ └ ┘ ┼ ╭ ╮ ╰ ╯ █ ░ ▒ ▓ ▁ ▂ ▃ ▄ ▅ ▆ ▇
```

Useful for:

- modern terminals
- readable dashboard UIs
- bar charts
- axes
- boxes

### 15.3 Braille mode

High-density plotting.

Useful for:

- line charts
- scatter plots
- dense time-series data
- compact charts

Braille mode should be implemented after basic Unicode rendering is stable.

## 16. Initial Chart Types

### 16.1 Sparkline

Purpose:

- compact trend display
- inline metrics
- dashboard summaries

Example:

```txt
Latency ▁▃▅▂▇▆▃ 120ms
```

API:

```tsx
<Sparkline data={[10, 20, 15, 40, 30]} />
```

Options:

```ts
type SparklineOptions = BaseChartOptions & {
  data: number[];
  showValue?: boolean;
};
```

### 16.2 Horizontal Bar Chart

Purpose:

- category comparison
- counts
- percentages
- distributions

Example:

```txt
2xx ████████████████████ 82%
4xx ████                 14%
5xx █                    4%
```

API:

```tsx
<BarChart
  data={[
    { label: "2xx", value: 82 },
    { label: "4xx", value: 14 },
    { label: "5xx", value: 4 },
  ]}
/>
```

### 16.3 Line Chart

Purpose:

- time series
- trend visualization
- benchmark history
- monitoring views

Example:

```txt
150 ┤      ╭╮
120 ┤   ╭──╯╰╮
 90 ┤╭──╯    ╰─
    └──────────
```

API:

```tsx
<LineChart
  data={data}
  xKey="time"
  yKey="value"
  height={12}
/>
```

### 16.4 Histogram

Purpose:

- value distribution
- latency distribution
- frequency analysis

Example:

```txt
0-50ms    ████
50-100ms  ███████████
100-200ms ██████
200ms+    ██
```

API:

```tsx
<Histogram data={values} buckets={8} />
```

## 17. Future Chart Types

After the MVP:

- vertical bar chart
- stacked bar chart
- grouped bar chart
- area chart
- scatter plot
- heatmap
- gauge
- progress chart
- box plot
- candlestick chart
- waterfall chart
- timeline chart
- tree map approximation

These should be added only after the core architecture proves stable.

## 18. Public API Strategy

The public API should be small at first.

Recommended v0.1 exports:

```ts
export { Sparkline } from "@opentui-charts/react";
export { BarChart } from "@opentui-charts/react";
export { LineChart } from "@opentui-charts/react";
export { Histogram } from "@opentui-charts/react";
```

Core exports:

```ts
export { createSparklineCommands } from "@opentui-charts/core";
export { createBarChartCommands } from "@opentui-charts/core";
export { createLineChartCommands } from "@opentui-charts/core";
export { createHistogramCommands } from "@opentui-charts/core";
```

Avoid exporting internal helpers too early. Once exported, they become part of the compatibility burden.

## 19. Error Handling

The library should fail gracefully.

For invalid data:

- do not crash the application by default
- render an empty chart or fallback message
- expose optional development warnings

Examples:

```txt
No data
Invalid data
Chart too small
```

Recommended behavior:

```ts
if data is empty:
  render "No data"

if width < minimum:
  render clipped fallback

if height < minimum:
  render compact fallback
```

## 20. Responsiveness and Resize

Charts must handle dynamic width and height.

The chart should re-compute layout when:

- container size changes
- data changes
- options change
- theme changes
- render mode changes

Avoid storing stale computed coordinates when size changes.

The core should expose pure render functions:

```ts
createLineChartCommands({ data, width, height, options })
```

This makes resize behavior naturally correct.

## 21. Streaming and Real-time Data

The library should support streaming data indirectly by allowing fast re-rendering with new data.

It should not own real-time state management.

Application code should manage rolling windows:

```ts
const latest = values.slice(-100);
```

Then pass that window to the chart.

Potential helper later:

```ts
createRollingSeries<T>(maxPoints: number)
```

But this should not be part of the first release unless clearly needed.

## 22. Interaction Model

Interactive charts are useful, but they should not be part of the first MVP unless the rendering foundation is solid.

Future interactions:

- focusable chart
- keyboard cursor
- inspect data point
- pan left/right
- zoom in/out
- toggle series
- show/hide legend
- select range

Possible keyboard mappings:

```txt
Left/Right: move cursor
Home/End: jump to first/last point
+/-: zoom
l: toggle legend
g: toggle grid
```

Interaction should be implemented in the OpenTUI adapter layer, not the core chart computation layer.

## 23. Accessibility and Text Alternatives

Terminal accessibility is different from browser accessibility, but the library should still support text alternatives.

Potential features:

```ts
summary?: string;
describeData?: boolean;
```

Example fallback summary:

```txt
Latency chart: min 80ms, max 220ms, average 130ms, trending upward.
```

This can also be useful for logs and snapshots.

## 24. Testing Strategy

Testing is critical if the goal is a stable ecosystem library.

### 24.1 Unit tests

Test pure chart calculations:

- scale mapping
- tick generation
- layout calculation
- data normalization
- clipping
- command generation

### 24.2 Snapshot tests

Render commands to plain strings and snapshot the output.

Example:

```txt
2xx ██████████ 80%
4xx ██         15%
5xx █          5%
```

Snapshot tests are especially useful for terminal rendering.

### 24.3 Property tests

Useful for scales and data normalization.

Examples:

- mapped values should stay inside range
- empty data should not crash
- equal values should not divide by zero
- negative values should map correctly
- clipping should never generate out-of-bound coordinates

### 24.4 Compatibility tests

Test rendering modes:

- ascii
- unicode
- braille

### 24.5 Visual examples

Maintain example apps that developers can run manually.

Examples:

```txt
examples/basic-dashboard
examples/streaming-line-chart
examples/histogram
examples/theme-demo
```

## 25. Documentation Strategy

The documentation should be treated as part of the product.

Recommended docs structure:

```txt
docs/
  introduction.md
  getting-started.md
  installation.md
  core-concepts.md
  rendering-modes.md
  theming.md
  charts/
    sparkline.md
    bar-chart.md
    line-chart.md
    histogram.md
  advanced/
    custom-renderers.md
    testing.md
    performance.md
    streaming-data.md
  api-reference/
```

Each chart doc should include:

- use case
- basic example
- props/options
- terminal preview
- common mistakes
- recommended dimensions

## 26. Versioning Strategy

Because the goal is stability, the project should use semantic versioning.

Before v1.0:

- keep public API small
- mark experimental exports clearly
- avoid unnecessary breaking changes
- provide migration notes between minor versions

Suggested phases:

```txt
v0.1: MVP chart primitives
v0.2: Better layout, themes, and axis behavior
v0.3: Braille line charts and improved rendering modes
v0.4: Interaction foundation
v0.5: Solid binding or advanced chart types
v1.0: Stable API guarantee
```

## 27. Performance Considerations

The library should avoid unnecessary allocation during frequent redraws.

Considerations:

- avoid expensive object creation in tight loops where practical
- cache normalized data only when safe
- keep core functions pure by default
- allow caller-controlled memoization in React/Solid bindings
- clip early
- skip drawing offscreen commands
- avoid rendering labels that cannot fit

Performance targets should be based on terminal use cases, not browser-scale charts.

Reasonable targets:

- small charts: instant
- dashboard with multiple charts: smooth
- streaming chart with 100-1000 points: acceptable redraw performance
- very large data sets: require downsampling

## 28. Downsampling

Line charts and dense time series need downsampling.

Initial strategy:

- simple bucket average
- min/max per bucket

Later strategy:

- Largest Triangle Three Buckets style algorithm
- domain-specific aggregation hooks

API idea:

```ts
downsample?: "none" | "average" | "minmax" | "lttb";
```

Do not implement too many strategies early. Start with simple, predictable behavior.

## 29. Internationalization and Formatting

The library should allow custom formatters instead of owning localization.

Examples:

```ts
valueFormatter={(value) => `${value.toFixed(1)}ms`}
labelFormatter={(label) => String(label).slice(0, 8)}
```

Avoid hardcoding units such as `ms`, `%`, or `$` into generic chart components.

## 30. Example Use Cases

### 30.1 API testing client

- request latency over time
- status code distribution
- response size history
- test pass/fail count
- benchmark comparison
- throughput per endpoint

### 30.2 Database client

- query duration history
- table size comparison
- index usage count
- slow query histogram

### 30.3 Git client

- commits over time
- changed files by type
- author contribution chart
- branch activity

### 30.4 Build tool

- build duration trend
- test duration distribution
- failed/passed/skipped tests
- bundle size chart

### 30.5 Monitoring TUI

- CPU usage
- memory usage
- network throughput
- error rate
- request rate

## 31. Suggested MVP Scope

The MVP should be small but high quality.

Recommended v0.1:

```txt
Core:
- draw command model
- linear scale
- band scale
- layout helpers
- ascii rendering helpers
- unicode rendering helpers

Charts:
- Sparkline
- Horizontal Bar Chart
- Line Chart
- Histogram

Packages:
- @opentui-charts/core
- @opentui-charts/opentui
- @opentui-charts/react

Docs:
- Getting Started
- Sparkline
- Bar Chart
- Line Chart
- Histogram
- Rendering Modes
- Theming

Tests:
- scale tests
- layout tests
- snapshot tests for all MVP charts
```

Defer:

```txt
- mouse interaction
- zoom/pan
- multi-series
- stacked charts
- Solid binding
- advanced animations
- advanced downsampling
```

## 32. Proposed Repository Structure

```txt
opentui-charts/
  package.json
  pnpm-workspace.yaml
  tsconfig.base.json
  README.md
  LICENSE

  packages/
    core/
      src/
        index.ts
        commands.ts
        geometry.ts
        scale/
          linear.ts
          band.ts
        layout/
          chart-layout.ts
          padding.ts
        axis/
          ticks.ts
          labels.ts
        render-mode/
          ascii.ts
          unicode.ts
          braille.ts
        charts/
          sparkline.ts
          bar-chart.ts
          line-chart.ts
          histogram.ts
        theme/
          theme.ts
          builtin-themes.ts
      test/

    opentui/
      src/
        index.ts
        render-commands-to-frame-buffer.ts
        frame-buffer-like.ts
        renderables/
          sparkline-renderable.ts
          bar-chart-renderable.ts
          line-chart-renderable.ts
          histogram-renderable.ts
      test/

    react/
      src/
        index.ts
        Sparkline.tsx
        BarChart.tsx
        LineChart.tsx
        Histogram.tsx
        types.ts
      test/

  examples/
    basic-dashboard/
    api-metrics-dashboard/
    streaming-line-chart/
    theme-demo/

  docs/
    introduction.md
    getting-started.md
    rendering-modes.md
    theming.md
    charts/
      sparkline.md
      bar-chart.md
      line-chart.md
      histogram.md
```

## 33. Development Milestones

### Milestone 1: Foundation

Deliverables:

- repository setup
- TypeScript project references or workspace setup
- core command model
- geometry utilities
- scale utilities
- plain string renderer for tests

Goal:

> Be able to generate and snapshot simple draw commands without OpenTUI.

### Milestone 2: Sparkline and Bar Chart

Deliverables:

- Sparkline core renderer
- BarChart core renderer
- Unicode and ASCII modes
- snapshot tests
- basic React components

Goal:

> Prove the chart command model works for simple charts.

### Milestone 3: OpenTUI Adapter

Deliverables:

- FrameBuffer-like interface
- command-to-FrameBuffer renderer
- basic OpenTUI example app

Goal:

> Render charts inside a real OpenTUI application.

### Milestone 4: Line Chart

Deliverables:

- linear scale integration
- axis layout
- line plotting
- clipping
- optional grid
- snapshot tests

Goal:

> Render useful time-series charts.

### Milestone 5: Histogram

Deliverables:

- bucket generation
- bar rendering
- formatter support
- snapshot tests

Goal:

> Support distribution-style analytics.

### Milestone 6: Documentation and Polish

Deliverables:

- README
- getting started guide
- chart docs
- example screenshots/text previews
- contribution guide
- release checklist

Goal:

> Make the library usable by external developers.

## 34. API Examples

### 34.1 Sparkline

```tsx
import { Sparkline } from "@opentui-charts/react";

<Sparkline
  data={[10, 14, 8, 22, 19, 30, 26]}
  width={20}
/>
```

### 34.2 Bar Chart

```tsx
import { BarChart } from "@opentui-charts/react";

<BarChart
  data={[
    { label: "success", value: 120 },
    { label: "warning", value: 30 },
    { label: "error", value: 8 },
  ]}
  width={50}
  height={6}
/>
```

### 34.3 Line Chart

```tsx
import { LineChart } from "@opentui-charts/react";

<LineChart
  data={points}
  xKey="timestamp"
  yKey="value"
  width={80}
  height={16}
  showAxis
/>
```

### 34.4 Histogram

```tsx
import { Histogram } from "@opentui-charts/react";

<Histogram
  data={[12, 18, 20, 22, 40, 44, 48, 60]}
  buckets={5}
  width={60}
  height={10}
/>
```

## 35. Implementation Notes

### 35.1 Keep core functions pure

Prefer this:

```ts
const commands = createLineChartCommands({
  data,
  width,
  height,
  options,
});
```

Avoid this in core:

```ts
chart.render(renderer);
```

Rendering to OpenTUI should happen in the adapter.

### 35.2 Normalize data early

Convert user data into internal normalized points:

```ts
type NormalizedPoint = {
  x: number;
  y: number;
  label?: string;
  raw?: unknown;
};
```

This keeps chart algorithms simpler.

### 35.3 Be strict internally, forgiving externally

Public APIs can accept flexible data.

Internal algorithms should operate on clean normalized data.

### 35.4 Prefer composition over inheritance

Avoid deep chart class hierarchies.

Prefer small functions:

```ts
normalizeData()
computeChartLayout()
createScale()
createAxisCommands()
createSeriesCommands()
```

### 35.5 Do not over-optimize too early

Start with correctness, snapshots, and stable APIs.

Optimize once real examples show performance issues.

## 36. Open Questions

These should be resolved during early implementation:

1. Should the primary API be component-first or core-first?
2. Should width/height be explicit or inferred from OpenTUI layout?
3. Should charts support interaction in v0.1?
4. How should OpenTUI theme detection map to chart themes?
5. Should the package include a string renderer for non-OpenTUI output?
6. Should Braille mode be included in v0.1 or v0.2?
7. What minimum terminal width and height should be supported?
8. Should multi-series line charts be part of the first stable API?

Recommended early answers:

```txt
1. Core-first internally, component-first for users.
2. Support explicit width/height first; layout inference later.
3. No interaction in v0.1.
4. Start with explicit chart themes; auto mapping later.
5. Yes, include string renderer for tests and documentation.
6. Defer Braille to v0.2 unless line chart quality requires it.
7. Support tiny fallbacks but document recommended sizes.
8. Design API with future multi-series in mind, but do not implement immediately.
```

## 37. Release Checklist

Before publishing v0.1:

```txt
- Package builds successfully
- Type declarations generated
- README includes install and basic examples
- All MVP charts have docs
- All MVP charts have snapshot tests
- Examples run successfully
- No application-specific naming leaks into public API
- Public API reviewed for stability
- License selected
- Contribution guide added
- Changelog added
```

## 38. Recommended First Build Order

Start with this order:

```txt
1. Draw command types
2. String renderer for tests
3. Geometry helpers
4. Linear scale
5. Sparkline
6. Bar chart
7. OpenTUI FrameBuffer adapter
8. React Sparkline and BarChart
9. Line chart
10. Histogram
11. Documentation and examples
```

This order reduces risk because it validates the architecture before introducing harder chart types.

## 39. Final Positioning

The library should be positioned as:

> A terminal-native charting library for OpenTUI applications.

Not:

> A browser charting library recreated in the terminal.

The strongest value proposition is:

```txt
Composable charts for high-performance terminal UIs.
```

The first release should be small, reliable, documented, and easy to adopt.

If the library gets the fundamentals right — command model, scales, layout, rendering modes, OpenTUI adapter, and React components — it can grow naturally into a core part of the OpenTUI ecosystem.

