# AGENTS.md

Guidance for coding agents working in `opentui-charts`.

## Repository overview

This is an early terminal-native charting library for OpenTUI.
Read `opentui_charts_library_design_doc.md` before significant design/API work.
The design goal is a generic ecosystem package, not an app-specific chart set.
Keep public APIs small, stable, strongly typed, framework-friendly, and testable.

Workspace layout:

- `packages/core`: pure chart computation and draw-command generation.
- `packages/opentui`: OpenTUI adapter/renderables for core draw commands.
- `packages/react`: React/OpenTUI binding components.
- `examples/basic-dashboard`: manual demo TUI.

Layering rule: `core` must not import OpenTUI, React, terminal IO, or app code.

## Package manager

Use npm; root declares `packageManager: npm@10.9.3`.
This is an ESM TypeScript workspace (`"type": "module"`).
Do not convert files to CommonJS.

## Commands

Install dependencies:

```bash
npm install
```

Build all workspaces:

```bash
npm run build
```

Typecheck all workspaces/examples with a typecheck script:

```bash
npm run typecheck
```

Run all tests:

```bash
npm test
```

Build one package:

```bash
npm run build -w @opentui-charts/core
npm run build -w @opentui-charts/opentui
npm run build -w @opentui-charts/react
```

Typecheck one package:

```bash
npm run typecheck -w @opentui-charts/core
npm run typecheck -w @opentui-charts/opentui
npm run typecheck -w @opentui-charts/react
```

Run tests for one package:

```bash
npm test -w @opentui-charts/core
npm test -w @opentui-charts/opentui
```

Run a single test file:

```bash
npx vitest run packages/core/test/sparkline.test.ts
npx vitest run packages/opentui/test/render-commands-to-frame-buffer.test.ts
```

Run tests by test-name pattern:

```bash
npx vitest run -t "renders a unicode single-line sparkline"
```

Run the basic dashboard example:

```bash
npm run dev -w @opentui-charts/example-basic-dashboard
```

Note: the example `dev` script currently uses `bun src/index.tsx`.
There is currently no lint script in `package.json`.
Before finishing broad changes, prefer `npm run typecheck && npm test && npm run build`.

## Generated files

Edit `src/` and `test/` files, not generated `dist/` output.
Only update package `dist/` artifacts if a user asks for release-ready builds.
Never edit `node_modules/`.

## TypeScript and imports

Use strict TypeScript; base config enables `strict` and `isolatedModules`.
Use ESM imports/exports only.
Use `import type` for type-only imports.
Prefer exported `type` aliases for public object shapes and unions.
Use `readonly` arrays in public inputs when mutation is not required.
Keep `src/index.ts` exports intentional and minimal.
Avoid exporting internal helpers until they are part of a stable API.
In `packages/core`, prefer relative imports such as `../commands`.
In adapter/binding packages, import public APIs by workspace package name.

## Formatting and naming

Use two-space indentation.
Use semicolons.
Use double quotes.
Use trailing commas in multi-line calls, arrays, objects, and parameter lists.
Prefer `const` unless reassignment is required.
Use named functions for exports and substantial helpers.
Use arrow functions for inline callbacks.
Use PascalCase for React components/classes.
Use camelCase for functions, variables, and properties.
Use names like `createSparklineCommands`, `renderCommandsToFrameBuffer`, and `SparklineOptions`.
Avoid abbreviations except conventional short fields like `x`, `y`, `fg`, and `bg`.

## Core design rules

Core functions should be pure, deterministic, and side-effect free.
Do not use process-level side effects or global mutable state in `packages/core`.
Core chart functions should return `DrawCommand[]`.
Supported commands are `cell`, `text`, `rect`, and `line`.
Terminal coordinates use `x` left-to-right and `y` top-to-bottom from origin top-left.
Commands should use integer cell coordinates or values renderers round deterministically.
Command order is paint order; later commands overwrite earlier cells.
Text should be clipped with `maxWidth` and/or renderer bounds.
Adapters should translate commands, not reinterpret chart geometry.
Keep line rendering deterministic across string and OpenTUI renderers.

## Chart behavior

Default `renderMode` should be `"unicode"` unless ASCII compatibility is requested.
Only expose render modes that are implemented and tested.
Do not expose Braille mode until it is fully implemented and snapshot-tested.
Normalize flexible public input into strict internal values early.
Use `Number.isFinite` for numeric validation.
Normalize dimensions with finite checks, `Math.floor`, and non-negative clamping.
Handle `NaN`, `Infinity`, invalid dimensions, empty data, and equal domains gracefully.
For zero width or height, return no commands.
For tiny charts, prefer clipped fallback text over throwing.
Use generic fallback messages such as `No data`, `Invalid data`, or `Chart too small`.
For current horizontal bar charts, keep values non-negative.
Custom formatters should own units/localization; do not hardcode `ms`, `%`, or `$`.
Prefer composition via helpers like `normalizeData`, `computeLayout`, and `createScale`.

## Error handling

Library code should not crash applications for ordinary invalid input.
Filter invalid numeric data where existing APIs do so.
Render empty/fallback output for empty data or unsupported tiny layouts.
Throw only for programmer errors that cannot be represented safely.
Never call `process.exit` in library packages.
`process.exit` is acceptable only in example app keyboard handlers.

## Tests

Vitest is the test runner.
Package tests live under `packages/<name>/test/`.
Test pure chart calculations in `packages/core`.
Use `renderCommandsToString` for readable exact string assertions.
Cover both `ascii` and `unicode` when changing rendering behavior.
Cover empty data, invalid values, zero/tiny dimensions, equal domains, and clipping.
When changing command semantics, update both string renderer and OpenTUI adapter tests.
Keep tests deterministic; avoid timers and randomness in unit tests.

## OpenTUI and React bindings

`packages/opentui` maps draw commands to OpenTUI-compatible buffers/renderables.
Keep `FrameBufferLike` minimal and easy to test.
Preserve style mapping for `fg` and `bg`.
`packages/react` should stay a thin binding over OpenTUI renderables.
React components should register chart elements before creating them.
Do not move chart algorithms into React components.

## Cursor and Copilot rules

No `.cursor/rules/`, `.cursorrules`, or `.github/copilot-instructions.md` files were present when this file was created.
If such files are added later, read them and incorporate their requirements here.
