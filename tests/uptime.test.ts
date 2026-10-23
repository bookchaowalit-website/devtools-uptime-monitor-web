import { describe, expect, it } from "vitest";
import { ENDPOINTS, boardMetrics, isRange, type Endpoint } from "@/lib/uptime";

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
