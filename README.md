# Signal Watch (uptime monitor)

A sample uptime board: two authored endpoint rows, a range switch and board numbers derived from the rows. Nothing is monitored.

Live: https://uptime-monitor.bookchaowalit.com (deployed by Vercel CLI; it can lag `main`, see `PRODUCT.md`).

## What it does not do

- No live checks, alerts or real response times. All numbers are sample data.

## Run

```bash
npm ci
npm run dev
```

## Checks

```bash
npm test           # Vitest: board numbers, MCP route, home page render, Sentry scrubbing
npm run lint
npm run typecheck
npm run build
```

CI (`.github/workflows/ci.yml`) runs the shared Node workflow (with a line-coverage gate) and the shared security
scan on every push and PR to `main`.

## Code map

- `lib/uptime.ts`: the sample endpoint log, ranges and `boardMetrics` (used by the page and the MCP route).
- `app/api/mcp/route.ts`: stateless JSON-RPC endpoint with `list_endpoints` and `get_summary` over the sample data.
- `lib/sentry.ts` + `instrumentation*.ts`: error reporting to Sentry, errors only, personal data stripped; off when `NEXT_PUBLIC_SENTRY_DSN` is unset.
- `app/more-projects/page.tsx`: shared portfolio link page (copied per repository, not a package).
