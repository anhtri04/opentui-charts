# Contributing to OpenTUI Charts

Thanks for your interest in contributing to `opentui-charts`. This project is an early terminal-native charting library for OpenTUI, so contributions should keep the public API small, generic, strongly typed, and easy to test.

## Development setup

This repository uses npm workspaces and ESM TypeScript.

```bash
npm install
```

Useful commands:

```bash
npm run typecheck
npm test
npm run build
```

For focused package work:

```bash
npm run typecheck -w @opentui-charts/core
npm test -w @opentui-charts/core
npm run build -w @opentui-charts/core
```

Run the manual dashboard example:

```bash
npm run dev -w @opentui-charts/example-basic-dashboard
```

## Repository layout

- `packages/core` — pure chart computation and draw-command generation.
- `packages/opentui` — OpenTUI adapter and renderables.
- `packages/react` — React/OpenTUI component bindings.
- `examples/basic-dashboard` — manual demo app.

Keep algorithms in `packages/core`. Adapter and framework packages should translate or bind core behavior, not reimplement chart geometry.

## Before adding or changing charts

Read these first:

- [`opentui_charts_library_design_doc.md`](./opentui_charts_library_design_doc.md)
- [`ADDING_CHARTS.md`](./ADDING_CHARTS.md)

General rules:

- Keep APIs generic; avoid app-specific options or names.
- Default to `renderMode: "unicode"` unless ASCII compatibility is requested.
- Only expose rendering modes that are implemented and tested.
- Handle invalid data, empty data, tiny dimensions, and equal domains gracefully.
- Prefer fallback draw commands such as `No data`, `Invalid data`, or `Chart too small` over throwing.
- Custom formatters should own units and localization.

## Core package rules

`packages/core` must stay pure and deterministic.

Do not import or use:

- OpenTUI
- React
- terminal I/O
- filesystem APIs
- process-level side effects
- app-specific code

Core chart functions should return `DrawCommand[]` and use integer terminal-cell coordinates where possible. Command order is paint order.

## TypeScript and style

- Use ESM imports/exports only.
- Use strict TypeScript-friendly types.
- Prefer `import type` for type-only imports.
- Use exported `type` aliases for public object shapes and unions.
- Use readonly arrays for public inputs when mutation is not required.
- Use two-space indentation, semicolons, double quotes, and trailing commas in multiline constructs.
- Keep `src/index.ts` exports intentional and minimal.
- Do not edit generated `dist/` files unless preparing release artifacts by request.

## Inline documentation

Public exports should have TSDoc comments:

- types
- functions
- classes
- React components
- hooks
- adapter contracts

Use normal `//` comments sparingly for non-obvious implementation invariants, such as rasterization, clipping, sampling, bucket boundaries, or adapter lifecycle behavior.

Keep comments factual and aligned with tests/current behavior.

## Testing expectations

Tests use Vitest and live under `packages/<name>/test/`.

When changing chart behavior, cover relevant cases:

- Unicode rendering
- ASCII rendering when supported
- empty data
- invalid values such as `NaN` and `Infinity`
- zero and tiny dimensions
- equal domains
- clipping behavior
- formatter behavior

Use `renderCommandsToString` for readable core chart assertions.

When changing command semantics or renderer behavior, update both core string renderer tests and OpenTUI adapter tests as needed.

## Pull request checklist

Before submitting broad changes, prefer running:

```bash
npm run typecheck
npm test
npm run build
```

Checklist:

- [ ] Public API remains generic and intentionally exported.
- [ ] Core remains independent of OpenTUI/React/app code.
- [ ] Invalid and tiny inputs are handled gracefully.
- [ ] Tests cover changed behavior.
- [ ] Public exports have useful TSDoc.
- [ ] README/docs are updated when user-facing behavior changes.
- [ ] Generated `dist/` files are not edited unless explicitly needed.

## License

By contributing, you agree that your contribution will be licensed under the repository's MIT license.
