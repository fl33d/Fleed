# Fleed architecture (source-verified)

Updated 2026-11-15. This document describes repository code, not an independently verified live deployment.

## Read/write flow

1. `src/routes/index.tsx` renders the portfolio editor using `Portfolio` and `Customize`.
2. Changes autosave in localStorage (`blank:draft`; key retained for migration compatibility).
3. `publishPortfolio` in `src/server/portfolio.functions.ts` normalises data and calls `savePortfolio`.
4. `src/server/portfolio.server.ts` stores JSON in Cloudflare D1 `portfolios`. New portfolio IDs and edit tokens come from crypto random bytes; only SHA-256 hashes of edit tokens are stored.
5. `/p/$id` loads a published portfolio through the server function and renders it read-only.

## Cloudflare resources

- Worker name: `fleed`.
- D1 database: `fleed-portfolios` with binding `fleed_portfolios`.
- R2: not wired in current source. Do not claim uploads work.
- GitHub Actions CI verifies build; Cloudflare Workers Builds is the intended production deployment pipeline from `main`.

## Operational concerns

- Frontend localStorage is not a cross-device account or recovery system.
- Edit-token possession provides update permission. Never log tokens or publish them in issues.
- Invalid edit credentials currently fall back to a new portfolio; treat improved UX/authorisation reporting as a follow-up.
- The upload and image endpoints are deliberately disabled. Re-enabling R2 needs an existing bucket, secure upload authorisation, size/type checks, per-user quotas or abuse controls, and a verification plan.
- Validate production DNS, live routes, builds and D1 binding with authenticated Cloudflare tools. Source code alone cannot verify operational health.

## Future work (not implemented)

- Secure R2 uploads with server-side quotas and media validation; image editing UI.
- Better recovery of published edit permissions.
- Testable end-to-end publishing flows against local D1.
- Portfolio accessibility and mobile visual audit.
- Optional user-facing AI assistance only if it solves a real problem and is backed by an actual provider integration.

Related: [engineering log](ENGINEERING_LOG.md), [operations](OPERATIONS.md).
