# Signal Watch (uptime monitor) — Product truth

> Inferred from the code and copy (no user interview). Checked against the portfolio card claims review
> (`portfolio-site-web/docs/audits/CARD-CLAIMS-REVIEW-2026-10.md`, row `uptime-monitor`) on 2026-10-23.

## What it is

A client-only sample board: two hard-coded endpoint rows (one up, one down) with sample uptime per range, and board numbers derived from those rows. No endpoint is ever checked.

## Who it is for

A portfolio visitor who wants to see how a calm uptime readout could look.

## What works today

1. Switch the sample range (24h, 7d, 30d); the average uptime follows the sample data of that range.
2. Targets, Up and Down are counted from the endpoint log, so the board always agrees with the rows below it.
3. `/api/mcp` answers JSON-RPC with `list_endpoints` and `get_summary` over the same sample data, marked `sample: true`; unknown tools, ranges and methods get JSON-RPC errors.
4. Front-end and server errors go to Sentry (errors only, personal data stripped) when `NEXT_PUBLIC_SENTRY_DSN` is set.

## What does not work (and must not be claimed)

- No health checks, Cloudflare Workers, multi-region probes, SSL alerts or monitoring of 100+ domains (removed from the portfolio card in the 2026-10 review).
- No real response times or status: every figure is authored sample data, labelled SAMPLE DATA / NOT LIVE on the page.
- No alert channel, history or configuration of targets.

## Live URL and deploy state

- Live: https://uptime-monitor.bookchaowalit.com (HTTP 200 on 2026-10-23).
- The Vercel project `bookchaowalit-uptime-monitor-frontend` was last deployed to production on 2026-08-24 (CLI, commit b92a59e, before the Next 16.4.2 CVE patch). The CVE patch deploy is queued with the coordinator (Vercel free-plan deploy limit hit on 2026-10-23). Its Git link names the old repository `bookchaowalit/bookchaowalit-uptime-monitor-frontend`, so a push to `main` does not deploy: the L2 work stays undeployed until the owner reconnects Vercel Git to this repository (owner action D9). `NEXT_PUBLIC_SENTRY_DSN` is already set on the Vercel project (Sentry project `devtools-uptime-monitor-web`, org `personal-yu0`).

## Boundaries

- Browser-only apart from the stateless `/api/mcp` route. Nothing calls an external endpoint.
