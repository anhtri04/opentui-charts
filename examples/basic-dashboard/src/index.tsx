import { createCliRenderer } from "@opentui/core";
import { createRoot, useKeyboard } from "@opentui/react";
import { BarChart, LineChart, Sparkline, Histogram } from "@opentui-charts/react";
import { useEffect, useMemo, useState } from "react";

function App() {
  const [latency, setLatency] = useState(() => [42, 48, 45, 61, 58, 73, 69, 80, 74, 66]);
  const [tick, setTick] = useState(0);

  useKeyboard((key) => {
    if (key.name === "q" || key.name === "escape" || (key.ctrl && key.name === "c")) {
      process.exit(0);
    }
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((value) => value + 1);
      setLatency((values) => {
        const last = values.at(-1) ?? 60;
        const next = Math.max(20, Math.min(120, Math.round(last + (Math.random() - 0.45) * 24)));
        return [...values, next].slice(-36);
      });
    }, 600);

    return () => clearInterval(interval);
  }, []);

  const statusData = useMemo(() => {
    const ok = 80 + (tick % 9);
    const warn = 12 + (tick % 5);
    const error = 3 + (tick % 4);

    return [
      { label: "2xx", value: ok },
      { label: "4xx", value: warn },
      { label: "5xx", value: error },
    ];
  }, [tick]);

  const latestLatency = latency.at(-1) ?? 0;

  return (
    <box flexDirection="column" padding={1} width="100%" height="100%">
      <text fg="#7dd3fc">OpenTUI Charts basic dashboard</text>
      <text fg="#94a3b8">Press q or Esc to exit</text>

      <scrollbox>
      {/* <box marginTop={1} flexDirection="column" border borderStyle="single" padding={1} width="100%" height={6}>
        <text fg="#e2e8f0">Latency trend</text>
        <Sparkline
          data={latency}
          width="100%"
          height={1}
          showValue
          valueFormatter={(value) => `${value}ms`}
          min={20}
          max={120}
          fg={latestLatency > 90 ? "#f87171" : "#22c55e"}
        />
      </box> */}

      {/* <box marginTop={1} flexDirection="column" border borderStyle="single" padding={1} width="100%" height={8}> */}
        <text fg="#e2e8f0">Latency line chart</text>
        <LineChart
          data={latency}
          width="100%"
          height={12}
          min={0}
          max={120}
          showGrid
          lineChar="_"
          valueFormatter={(value) => `${Math.round(value)}`}
          fg="#38bdf8"
          axisColor="#64748b"
          gridColor="#334155"
        />
      {/* </box> */}

      {/* <box marginTop={1} flexDirection="column" border borderStyle="single" padding={1} width="100%" height={8}>
        <text fg="#e2e8f0">HTTP status distribution</text>
        <BarChart
          data={statusData}
          width="100%"
          height={3}
          labelWidth={3}
          valueFormatter={(value) => `${value}%`}
          fg="#a78bfa"
        />
      </box>

      <box marginTop={1} flexDirection="column" border borderStyle="single" padding={1} width="100%" height={8}>
        <text fg="#e2e8f0">Latency distribution</text>
        <Histogram
          data={latency}
          width="100%"
          height={5}
          buckets={8}
          valueFormatter={(value) => `${Math.round(value)}`}
          fg="#f97316"
        />
      </box> */}
      </scrollbox>

    </box>
  );
}

const renderer = await createCliRenderer({
  exitOnCtrlC: true,
});

createRoot(renderer).render(<App />);
