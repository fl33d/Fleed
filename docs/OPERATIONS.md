# Fleed release and deployment checklist

## Verify locally

    pnpm install --frozen-lockfile
    pnpm exec wrangler types
    pnpm test
    pnpm typecheck
    pnpm build
    pnpm --dir tools/fleed-mcp install --no-frozen-lockfile
    pnpm --dir tools/fleed-mcp typecheck
    pnpm --dir tools/fleed-mcp test

Test creating a draft, publishing, viewing `/p/<id>`, updating with the original edit token, and refreshing public content.

## Deployment

- Source of truth: GitHub `fl33d/Fleed`, branch `main`.
- Production deployment mechanism: **Cloudflare Workers Builds**. Do not add a competing GitHub Actions deploy workflow.
- Ensure Cloudflare's Git integration points to the correct repository and main branch.
- Confirm build command and deploy command through the Cloudflare dashboard; do not guess from CI.
- On each release, inspect Cloudflare build result and the *actual* production Worker deployment.
- Verify `https://fleed.online/` and published `/p/<id>` from a real browser, including DNS/SSL.
- Never change DNS, billing, accounts, production bindings, D1 data or secrets without owner approval.

## R2 images — not enabled

- Confirm the R2 bucket exists and check billing/free allowances before any binding change.
- Implement authorisation tied to a valid edit token; the public must not be allowed unmetered anonymous uploads.
- Validate MIME signatures, maximum bytes, per-portfolio quotas, rate limits and R2 object serving headers.
- Exercise failure cases including malicious files, quota exhaustion, missing objects and revoked edit access.
- Do not merge upload code to production until safeguards and manual tests pass.

## MCP/AI

- `.vscode/mcp.json` contains Cloudflare MCP integrations for a compatible local agent.
- `tools/fleed-mcp/` is an optional read-only developer MCP; it requires local npm/pnpm setup and scoped API credentials for privileged tools.
- Do not claim that Claude/GPT is integrated into the published portfolio builder unless user-facing features actually call a provider and have been tested.

## What to say on a CV

Accurate after source verification: 'Built a full-stack portfolio editor using React, TypeScript, TanStack Start, Cloudflare Workers and D1, with shareable pages and token-based updates.'
Only after test and merge: 'Added automated regression tests and developed a read-only TypeScript MCP server for Cloudflare deployment/database diagnostics.'
Do not describe unfinished image storage, live custom-domain hosting or user-facing AI generation as completed.
