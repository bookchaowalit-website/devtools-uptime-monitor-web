"use client";

import { useState } from "react";
import { ChartPanel, DashFoot, DashTop, Pill, Segmented, Stat } from "@/components/dashboard-shell";
import { EndpointList } from "@/components/endpoint-list";
import { ENDPOINTS, RANGES, boardMetrics, bucketLabels, chartTicks, uptimeSeries, type Range } from "@/lib/uptime";

const RANGE_LABELS: Record<Range, string> = { "24h": "24 hours", "7d": "7 days", "30d": "30 days" };
const PERIODS = RANGES.map((id) => ({ id, label: RANGE_LABELS[id] }));

export default function Home() {
  const [range, setRange] = useState<Range>("7d");
  const metrics = boardMetrics(ENDPOINTS, range);
  const period = RANGE_LABELS[range];
  const values = uptimeSeries(ENDPOINTS, range);
  const labels = bucketLabels(range);
  const { ticks, tickLabels } = chartTicks(range);
  const bucket = range === "24h" ? "hour" : "day";
  const low = values.length ? values.indexOf(Math.min(...values)) : -1;

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
          {metrics.map((metric) => <Stat key={metric.label} label={metric.label} value={metric.value} note={metric.note} tone={metric.tone} />)}
        </ul>

        <div className="ds-grid">
          <ChartPanel
            title={`Uptime per ${bucket}`}
            subtitle={low >= 0 ? `Average of both endpoints · lowest ${values[low]}% (${labels[low].toLowerCase()})` : undefined}
            summary={`Average uptime per ${bucket} over the last ${period}${low >= 0 ? `, lowest ${values[low]}% ${labels[low].toLowerCase()}` : ""}.`}
            values={values}
            labels={labels}
            ticks={ticks}
            tickLabels={tickLabels}
            max={100}
            unit="Uptime (%)"
            yUnit="%"
            labelHeading={bucket === "hour" ? "Hour" : "Day"}
          />

          <section className="ds-panel" aria-labelledby="endpoints-heading">
            <div className="ds-panel-head">
              <div>
                <h2 id="endpoints-heading">Endpoints</h2>
                <p>Last check and uptime over {period}</p>
              </div>
            </div>
            <EndpointList endpoints={ENDPOINTS} range={range} />
          </section>
        </div>

        <p className="ds-note">A visual sample only: no remote check runs behind this page and no alert channel is connected. The times and figures are authored examples.</p>
      </main>

      <DashFoot source="https://github.com/bookchaowalit-website/devtools-uptime-monitor-web" />
    </div>
  );
}
