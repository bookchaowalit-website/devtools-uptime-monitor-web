// Signal Watch: a fixed sample of endpoint checks and the board numbers derived from it.
// Nothing here calls an endpoint; every figure is authored sample data and is labelled that way on the page.

export const RANGES = ["24h", "7d", "30d"] as const;
export type Range = (typeof RANGES)[number];
export type EndpointStatus = "up" | "down";

export type Endpoint = {
  name: string;
  value: string;
  status: EndpointStatus;
  note: string;
  /** Sample share of checks that answered, per range, in percent. */
  uptime: Record<Range, number>;
};

export const ENDPOINTS: Endpoint[] = [
  { name: "bookchaowalit.com", value: "200 · 120ms", status: "up", note: "responded", uptime: { "24h": 100, "7d": 99.9, "30d": 99.7 } },
  { name: "api.example", value: "timeout", status: "down", note: "no response", uptime: { "24h": 87.5, "7d": 98.1, "30d": 98.9 } },
];

export function isRange(value: string): value is Range {
  return (RANGES as readonly string[]).includes(value);
}

export type Metric = { label: string; value: string; note: string };

/** Board numbers always agree with the endpoint log they summarise. */
export function boardMetrics(endpoints: Endpoint[], range: Range): Metric[] {
  const up = endpoints.filter((endpoint) => endpoint.status === "up").length;
  const average = endpoints.length ? endpoints.reduce((sum, endpoint) => sum + endpoint.uptime[range], 0) / endpoints.length : 0;
  return [
    { label: "Targets", value: String(endpoints.length), note: "sample scope" },
    { label: "Up", value: String(up), note: "responding" },
    { label: "Down", value: String(endpoints.length - up), note: "needs a look" },
    { label: "Avg uptime", value: endpoints.length ? `${average.toFixed(1)}%` : "—", note: "sample window" },
  ];
}
