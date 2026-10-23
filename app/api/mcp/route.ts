import { NextResponse } from "next/server";
import { ENDPOINTS, RANGES, boardMetrics, isRange } from "@/lib/uptime";

// Stateless JSON-RPC MCP endpoint over the same authored sample board the page shows. No tool checks a real
// endpoint: the results say "sample" so a caller cannot mistake them for live monitoring.

type RpcRequest = { id?: number | string | null; method?: string; params?: { name?: string; arguments?: Record<string, unknown> } };

const TOOLS = [
  { name: "list_endpoints", description: "The sample endpoint log (authored data, no live checks)", inputSchema: { type: "object", properties: {} } },
  {
    name: "get_summary",
    description: "Board numbers for one sample range, derived from the sample log",
    inputSchema: { type: "object", properties: { range: { type: "string", enum: [...RANGES] } }, required: ["range"] },
  },
];

class RpcError extends Error {
  constructor(readonly code: number, message: string) {
    super(message);
  }
}

function callTool(name: string | undefined, args: Record<string, unknown> = {}) {
  switch (name) {
    case "list_endpoints":
      return { sample: true, endpoints: ENDPOINTS };
    case "get_summary": {
      const range = String(args.range ?? "");
      if (!isRange(range)) throw new RpcError(-32602, `Unknown range: ${range}`);
      return { sample: true, range, metrics: boardMetrics(ENDPOINTS, range) };
    }
    default:
      throw new RpcError(-32602, `Unknown tool: ${String(name)}`);
  }
}

export async function POST(request: Request) {
  let id: RpcRequest["id"] = null;
  try {
    const body = (await request.json()) as RpcRequest;
    id = body.id ?? null;
    let result: unknown;
    switch (body.method) {
      case "initialize":
        result = { protocolVersion: "2024-11-05", capabilities: { tools: {} }, serverInfo: { name: "Signal Watch", version: "1.0.0" } };
        break;
      case "tools/list":
        result = { tools: TOOLS };
        break;
      case "tools/call":
        result = callTool(body.params?.name, body.params?.arguments);
        break;
      default:
        throw new RpcError(-32601, `Unknown method: ${String(body.method)}`);
    }
    return NextResponse.json({ jsonrpc: "2.0", id, result });
  } catch (error) {
    const code = error instanceof RpcError ? error.code : -32700;
    const message = error instanceof RpcError ? error.message : "Parse error";
    return NextResponse.json({ jsonrpc: "2.0", id, error: { code, message } }, { status: 400 });
  }
}
