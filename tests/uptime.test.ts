import { describe, expect, it } from "vitest";
import { ENDPOINTS, RANGES, boardMetrics, bucketLabels, chartTicks, isRange, mean, minutesAgo, uptimeSeries, type Endpoint } from "@/lib/uptime";

const value = (metrics: ReturnType<typeof boardMetrics>, label: string) => metrics.find((m) => m.label === label)?.value;

describe("boardMetrics", () => {
  it("agrees with the endpoint log it summarises (targets, up, down)", () => {
    const metrics = boardMetrics(ENDPOINTS, "7d");
    expect(value(metrics, "Targets")).toBe(String(ENDPOINTS.length));
    expect(value(metrics, "Up")).toBe("1");
    expect(value(metrics, "Down")).toBe("1");
  });

  it("averages the sample uptime of the chosen range", () => {
    expect(value(boardMetrics(ENDPOINTS, "24h"), "Avg uptime")).toBe("93.8%");
    expect(value(boardMetrics(ENDPOINTS, "7d"), "Avg uptime")).toBe("99.0%");
    expect(value(boardMetrics(ENDPOINTS, "30d"), "Avg uptime")).toBe("99.3%");
  });

  it("shows a dash instead of NaN when there is nothing to watch", () => {
    const metrics = boardMetrics([], "24h");
    expect(value(metrics, "Targets")).toBe("0");
    expect(value(metrics, "Avg uptime")).toBe("—");
  });

  it("counts every down endpoint", () => {
    const down: Endpoint = { ...ENDPOINTS[1], name: "b" };
    expect(value(boardMetrics([ENDPOINTS[0], ENDPOINTS[1], down], "7d"), "Down")).toBe("2");
  });
});

describe("isRange", () => {
  it("accepts only the three sample ranges", () => {
    expect(isRange("24h")).toBe(true);
    expect(isRange("30d")).toBe(true);
    expect(isRange("1y")).toBe(false);
  });
});

describe("sample history", () => {
  it("averages to each endpoint's stated uptime, and the week is the end of the month", () => {
    for (const endpoint of ENDPOINTS) {
      for (const range of RANGES) expect(mean(endpoint.history[range]).toFixed(1)).toBe(endpoint.uptime[range].toFixed(1));
      expect(endpoint.history["30d"].slice(-7)).toEqual(endpoint.history["7d"]);
      expect(endpoint.history["24h"]).toHaveLength(24);
    }
  });

  it("charts one value per bucket whose mean is the board average", () => {
    for (const range of RANGES) {
      const series = uptimeSeries(ENDPOINTS, range);
      expect(series).toHaveLength(bucketLabels(range).length);
      expect(`${mean(series).toFixed(1)}%`).toBe(value(boardMetrics(ENDPOINTS, range), "Avg uptime"));
      const { ticks, tickLabels } = chartTicks(range);
      expect(ticks).toHaveLength(tickLabels.length);
      expect(Math.max(...ticks)).toBe(series.length - 1);
    }
    expect(uptimeSeries([], "7d")).toEqual([]);
  });

  it("labels buckets oldest first, ending now", () => {
    expect(bucketLabels("24h").slice(0, 2)).toEqual(["24 h ago", "23 h ago"]);
    expect(bucketLabels("24h").at(-1)).toBe("Last hour");
    expect(bucketLabels("7d")).toEqual(["6 days ago", "5 days ago", "4 days ago", "3 days ago", "2 days ago", "Yesterday", "Today"]);
    expect(bucketLabels("30d")[0]).toBe("29 days ago");
  });

  it("says how long ago the last check ran", () => {
    expect(minutesAgo(0)).toBe("just now");
    expect(minutesAgo(2)).toBe("2 min ago");
  });

  it("drops the red tone and says all answering when nothing is down", () => {
    const down = boardMetrics([ENDPOINTS[0]], "7d").find((m) => m.label === "Down");
    expect(down).toEqual({ label: "Down", value: "0", note: "all answering" });
    expect(boardMetrics(ENDPOINTS, "7d").find((m) => m.label === "Down")?.tone).toBe("red");
    expect(mean([])).toBe(0);
  });
});
