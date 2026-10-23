import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/mcp/route";

function rpc(body: unknown) {
  return POST(new Request("http://localhost/api/mcp", { method: "POST", body: JSON.stringify(body) }));
}

describe("MCP route", () => {
  it("echoes the JSON-RPC request id and lists the real tools", async () => {
    const body = await (await rpc({ jsonrpc: "2.0", id: 7, method: "tools/list" })).json();
    expect(body.id).toBe(7);
    expect(body.result.tools.map((t: { name: string }) => t.name)).toEqual(["list_endpoints", "get_summary"]);
  });

  it("list_endpoints returns the sample log, marked as sample", async () => {
    const { result } = await (await rpc({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "list_endpoints" } })).json();
    expect(result.sample).toBe(true);
    expect(result.endpoints.map((e: { name: string }) => e.name)).toEqual(["bookchaowalit.com", "api.example"]);
  });

  it("get_summary derives numbers for a range and rejects an unknown range", async () => {
    const ok = await (await rpc({ jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "get_summary", arguments: { range: "24h" } } })).json();
    expect(ok.result.metrics[0]).toEqual({ label: "Targets", value: "2", note: "sample scope" });
    const bad = await (await rpc({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "get_summary", arguments: { range: "1y" } } })).json();
    expect(bad.error.code).toBe(-32602);
    expect(bad.id).toBe(3);
  });

  it("rejects an unknown tool instead of pretending to call it", async () => {
    const body = await (await rpc({ jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "ping_now" } })).json();
    expect(body.result).toBeUndefined();
    expect(body.error.code).toBe(-32602);
  });

  it("answers an unknown method and malformed JSON with JSON-RPC errors", async () => {
    expect((await (await rpc({ jsonrpc: "2.0", id: 5, method: "nope" })).json()).error.code).toBe(-32601);
    const res = await POST(new Request("http://localhost/api/mcp", { method: "POST", body: "{" }));
    expect((await res.json()).error.code).toBe(-32700);
  });
});
