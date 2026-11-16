"use client";

import { useState } from "react";
import { DashFoot, DashTop, Pill, Segmented, Stat } from "@/components/dashboard-shell";
import { EndpointList } from "@/components/endpoint-list";
import { ENDPOINTS, RANGES, boardMetrics, type Range } from "@/lib/uptime";

const RANGE_LABELS: Record<Range, string> = { "24h": "24 hours", "7d": "7 days", "30d": "30 days" };
const PERIODS = RANGES.map((id) => ({ id, label: RANGE_LABELS[id] }));

export default function Home() {
  const [range, setRange] = useState<Range>("7d");
  const metrics = boardMetrics(ENDPOINTS, range);
  const period = RANGE_LABELS[range];

  return (
    <div className="ds">
      <a className="ds-skip" href="#main">Skip to content</a>
      <DashTop name="Uptime" tagline="Two sample endpoints" />

      <main id="main" tabIndex={-1} className="ds-main">
        <div className="ds-head">
          <div>
            <h1>Endpoint uptime</h1>
            <p>Last {period} · share of checks that answered <Pill tone="grey">Sample data</Pill></p>
          </div>
          <Segmented label="Period" options={PERIODS} value={range} onChange={setRange} />
        </div>

        <ul className="ds-stats" aria-label={`Last ${period} at a glance`}>
          {metrics.map((metric) => <Stat key={metric.label} label={metric.label} value={metric.value} note={metric.note} />)}
        </ul>

        <section className="ds-panel" aria-labelledby="endpoints-heading">
          <div className="ds-panel-head">
            <div>
              <h2 id="endpoints-heading">Endpoints</h2>
              <p>Last check and uptime over {period}</p>
            </div>
          </div>
          <EndpointList endpoints={ENDPOINTS} range={range} />
        </section>

        <p className="ds-note">A visual sample only: no remote check runs behind this page and no alert channel is connected.</p>
      </main>

      <DashFoot source="https://github.com/bookchaowalit-website/devtools-uptime-monitor-web" />
    </div>
  );
}
