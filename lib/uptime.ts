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
  /** Minutes since the sample's last check. */
  checkedMinutesAgo: number;
  /** Sample share of checks that answered, per range, in percent. */
  uptime: Record<Range, number>;
  /**
   * The same share per bucket, oldest first: 24 hours for 24h, one value per day for 7d and 30d.
   * Its mean (one decimal) is `uptime[range]`, and the last 7 days of 30d are the 7d series.
   */
  history: Record<Range, number[]>;
};

const fill = (count: number, value = 100) => Array.from({ length: count }, () => value);

// bookchaowalit.com: one short dip in the last week, two older ones in the month.
const siteWeek = [100, 100, 100, 99.3, 100, 100, 100];
// Sample API: timing out for the last 3 hours, a slow day earlier this week, a long outage earlier in the month.
const apiDay = [...fill(21), 0, 0, 0];
const apiWeek = [100, 100, 99.2, 100, 100, 100, 87.5];

export const ENDPOINTS: Endpoint[] = [
  {
    name: "bookchaowalit.com", value: "200 · 120ms", status: "up", note: "responded", checkedMinutesAgo: 1,
    uptime: { "24h": 100, "7d": 99.9, "30d": 99.7 },
    history: { "24h": fill(24), "7d": siteWeek, "30d": [...fill(8), 96, ...fill(13), 95.7, ...siteWeek] },
  },
  {
    name: "Sample API (api.example.com)", value: "timeout", status: "down", note: "no response", checkedMinutesAgo: 2,
    uptime: { "24h": 87.5, "7d": 98.1, "30d": 98.9 },
    history: { "24h": apiDay, "7d": apiWeek, "30d": [...fill(11), 80.3, ...fill(11), ...apiWeek] },
  },
];

export function isRange(value: string): value is Range {
  return (RANGES as readonly string[]).includes(value);
}

/** "just now", "1 min ago", "5 min ago". */
export function minutesAgo(minutes: number): string {
  return minutes < 1 ? "just now" : `${minutes} min ago`;
}

/** The mean of a list, or 0 for an empty one. */
export function mean(values: number[]): number {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

/** Bucket labels, oldest first, for the table and the chart: "24 h ago" … "Last hour", "6 days ago" … "Today". */
export function bucketLabels(range: Range): string[] {
  if (range === "24h") return Array.from({ length: 24 }, (_, i) => (i === 23 ? "Last hour" : `${24 - i} h ago`));
  const days = range === "7d" ? 7 : 30;
  return Array.from({ length: days }, (_, i) => {
    const back = days - 1 - i;
    return back === 0 ? "Today" : back === 1 ? "Yesterday" : `${back} days ago`;
  });
}

/** Average uptime of all endpoints per bucket, one decimal; equal-length series, so its mean is the board average. */
export function uptimeSeries(endpoints: Endpoint[], range: Range): number[] {
  if (endpoints.length === 0) return [];
  const length = endpoints[0].history[range].length;
  return Array.from({ length }, (_, i) => Number(mean(endpoints.map((endpoint) => endpoint.history[range][i] ?? 0)).toFixed(1)));
}

/**
 * Where the chart's x labels sit, with short words under each. The 24-hour view is time-of-day: each value is one hour
 * bucket, so it uses the shell's `buckets` mode and the ticks are bucket edges (0 = 24 h ago, 24 = now), six hours apart.
 * Day views name whole days, so their ticks sit under the day's point.
 */
export function chartTicks(range: Range): { ticks: number[]; tickLabels: string[]; buckets: boolean } {
  if (range === "24h") return { ticks: [0, 6, 12, 18, 24], tickLabels: ["24 h ago", "18 h", "12 h", "6 h", "Now"], buckets: true };
  if (range === "7d") return { ticks: [0, 3, 6], tickLabels: ["6 days ago", "3 days ago", "Today"], buckets: false };
  return { ticks: [0, 10, 20, 29], tickLabels: ["29 days ago", "19 days", "9 days", "Today"], buckets: false };
}

export type Metric = { label: string; value: string; note: string; tone?: "red" };

/** Board numbers always agree with the endpoint log they summarise. */
export function boardMetrics(endpoints: Endpoint[], range: Range): Metric[] {
  const up = endpoints.filter((endpoint) => endpoint.status === "up").length;
  const down = endpoints.length - up;
  const average = mean(endpoints.map((endpoint) => endpoint.uptime[range]));
  return [
    { label: "Targets", value: String(endpoints.length), note: "sample scope" },
    { label: "Up", value: String(up), note: "responding" },
    down > 0
      ? { label: "Down", value: String(down), note: "not answering: needs a look", tone: "red" }
      : { label: "Down", value: "0", note: "all answering" },
    { label: "Avg uptime", value: endpoints.length ? `${average.toFixed(1)}%` : "—", note: "sample window" },
  ];
}
