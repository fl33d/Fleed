# Fleed — verified engineering status

Updated 15 November 2026, after GitHub Actions runs 43742793959 (CI) and 43742793969 (live origin diagnostics).

| Capability | State | Evidence |
| --- | --- | --- |
| React 19 + TypeScript + TanStack Start editor | Implemented in source | `src/routes/index.tsx`, `src/components/portfolio/` |
| Browser draft saving | Implemented in source | `src/routes/index.tsx` localStorage handlers |
| Public portfolio pages and updates | Implemented in source | `src/routes/p.$id.tsx`, server functions, D1 persistence |
| D1 storage / hashed edit tokens | Implemented in source | `src/server/portfolio.server.ts`, migrations |
| Cloudflare Worker | Verified reachable | `https://fleed.fleed.workers.dev/` HTTP 200, CF-Ray |
| Worker missing-page route | Verified reachable | `/p/000000000000` returned expected 404 via Cloudflare |
| Custom domain `fleed.online` | **Still Netlify** | Netlify `server` / `x-nf-request-id`; NS nsone.net |
| R2-backed image uploads | **Disabled** | `api/upload` HTTP 503 in source; `img/$key` 404, no R2 binding |
| CI and regression checks | Pass in review branch | GitHub Actions run 43742793959 |
| Local Fleed developer MCP server | Protocol-tested in CI only | `tools/fleed-mcp/`; stdio self-test passed in CI |
| Actual authorised Cloudflare API calls via MCP | Not verified | Requires owner's scoped local credentials and live client |
| User-facing GPT/Claude integration | Not implemented | No supported provider feature in app source |
| Cloudflare custom domain, production D1 write flow | Not independently verified | Domain cutover blocked, no live publish/write tests conducted |

## Pull request state

- [PR #1](https://github.com/fl33d/Fleed/pull/1) is **draft**, not merged or deployed.
- Includes obsolete Netlify config removal, architecture/operations docs, tests, CI, scheduled site monitoring, Dependabot and MCP read-only developer tooling.
- Current public `main` is unchanged.

## What the CV can accurately say

- Built a personal portfolio builder with React 19, TypeScript, TanStack Start and a Cloudflare Workers + D1 implementation, including shareable links and edit-token-based updates.
- Implemented a read-only TypeScript Model Context Protocol development integration with five tools and automated MCP client/protocol tests **on a review branch**.
- Set up automated regression testing, GitHub Actions build validation, scheduled availability and origin diagnostics, and dependency update PRs **on a review branch**.

## Not yet claimable

- Serving `fleed.online` from Cloudflare (domain still Netlify).
- Working Cloudflare R2 image uploads.
- A deployed user-facing Claude/GPT feature.
- Production custom domain migration, end-to-end publishing verification, or validated provider MCP API credentials.

## Next responsible actions

1. Review and merge PR #1 when ready. Because `main` can trigger Cloudflare Workers Builds, do not merge until happy with the code and deploy process.
2. Independently confirm the Cloudflare Worker deployment and live D1 binding in Cloudflare dashboard.
3. Plan DNS cutover with domain account access and rollback; `docs/DOMAIN_CUTOVER.md` explains the procedure.
4. Build and test secure media upload architecture only after confirming R2 account/resource/budget status.
5. Add E2E publish/update tests and improve lost token recovery.
6. Only add genuine AI provider features if there is a compelling user benefit and a safe cost/privacy design.

## Design/engineering integrity

Changing README wording, hiding Netlify, or adding an AI logo doesn't change where the production hostname is hosted or what functions run. Validate the actual integration, then describe it truthfully.
