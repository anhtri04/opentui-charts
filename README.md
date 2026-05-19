# OpenTUI Charts

Terminal-native charts for OpenTUI applications.

This repository is an early TypeScript workspace for a reusable charting layer that can render compact, deterministic charts in terminal UIs. The library is designed around a pure core package that produces draw commands, plus adapter packages that render those commands in OpenTUI and OpenTUI React.

## Packages

- `@opentui-charts/core` — pure chart computation and draw-command generation.
- `@opentui-charts/opentui` — OpenTUI frame buffer/renderable adapter.
- `@opentui-charts/react` — React/OpenTUI chart components.
- `@opentui-charts/example-basic-dashboard` — manual demo dashboard.

## Current chart support

- Sparkline
- Horizontal bar chart

Additional chart types are planned as the public API stabilizes.

## Install

This repository uses npm workspaces.

```bash
npm install
```

## Development commands

Build all workspaces:

```bash
npm run build
```

Typecheck all workspaces:

```bash
npm run typecheck
```

Run all tests:

```bash
npm test
```

Run a single test file:

```bash
npx vitest run packages/core/test/sparkline.test.ts
```

Run the demo dashboard:

```bash
npm run dev -w @opentui-charts/example-basic-dashboard
```

## Core usage

```ts
import {
  createSparklineCommands,
  renderCommandsToString,
} from "@opentui-charts/core";

const commands = createSparklineCommands({
  data: [10, 20, 15, 30],
  width: 8,
});

console.log(renderCommandsToString(commands, { width: 8, height: 1 }));
```

## React/OpenTUI usage

```tsx
import { Sparkline } from "@opentui-charts/react";

<Sparkline
  data={[10, 20, 15, 30]}
  width={20}
  showValue
/>;
```

## Design notes

See [`opentui_charts_library_design_doc.md`](./opentui_charts_library_design_doc.md) for the detailed design direction.

Important principles:

- Keep `packages/core` pure and independent of OpenTUI/React.
- Render charts by producing deterministic draw commands.
- Prefer graceful fallback output for invalid or tiny inputs.
- Keep public APIs small and strongly typed.
- Support terminal constraints directly instead of copying browser chart APIs.

## License

MIT — see [`LICENSE`](./LICENSE).
