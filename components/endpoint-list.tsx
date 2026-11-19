import { Pill } from "@/components/dashboard-shell";
import { minutesAgo, type Endpoint, type Range } from "@/lib/uptime";

/** The endpoint rows for one period, or a plain note when there is nothing to watch yet. */
export function EndpointList({ endpoints, range }: { endpoints: Endpoint[]; range: Range }) {
  if (endpoints.length === 0) {
    return (
      <p className="ds-callout" role="status">
        <strong>No endpoints yet</strong>
        <span>Add an endpoint to see its last check and uptime here.</span>
      </p>
    );
  }
  return (
    <ul className="ds-rows">
      {endpoints.map((endpoint) => {
        // The dot, the pill and the bar share one tone, so a Down row never shows the normal (good-looking) bar.
        const tone = endpoint.status === "up" ? "green" : "red";
        return (
          <li key={endpoint.name} className="ds-row">
            <span className="ds-row-name"><span className="ds-dot" data-tone={tone} aria-hidden="true" />{endpoint.name}</span>
            <span className="ds-row-detail">Last check {minutesAgo(endpoint.checkedMinutesAgo)}: {endpoint.value} · {endpoint.uptime[range]}% uptime</span>
            <span className="ds-row-value"><Pill tone={tone}>{endpoint.status === "up" ? "Up" : "Down"}</Pill></span>
            <span className="ds-meter" data-tone={tone} aria-hidden="true"><span style={{ width: `${endpoint.uptime[range]}%` }} /></span>
          </li>
        );
      })}
    </ul>
  );
}
