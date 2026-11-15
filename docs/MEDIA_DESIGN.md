# Secure R2 media implementation design — not deployed

Status: DESIGN / BLOCKED pending account review. The current upload route returns 503 and the image route returns 404. This design is not permission to activate R2 or change billing.

## Why this needs more than an upload button

An anonymous portfolio creator can generate edit tokens. If every token could upload large or unlimited media, automated abuse could exhaust storage and billable operations even with a per-portfolio limit. A valid edit token alone is **not** sufficient global abuse prevention.

## Proposed upload journey

1. User publishes portfolio and receives an edit token in browser storage.
2. User selects an image in an accessible file picker. The browser compresses/re-encodes supported photos when possible; the original is never uploaded without an explicit file-size check.
3. The Worker validates both edit ID and token against D1, verifies the upload is subject to abuse limits, bounds the bytes, inspects file content and stores with a random object key in R2.
4. The Worker responds with an internal `/img/<key>` path; only this safe path is accepted in saved portfolio content.
5. The reader route serves a known safe image content-type, `X-Content-Type-Options: nosniff`, appropriate caching and no user-controlled HTML or SVG.

## Minimum controls for any production trial

- **Authentication:** verify a portfolio edit token on every upload and delete. Never accept anonymous raw uploads.
- **Abuse gate:** make server-validated Cloudflare Turnstile and rate limits/quotas part of the trial; use authenticated user/portfolio identifiers where possible. Rate-limiting bindings are approximate per Cloudflare location, not strict global quotas.
- **Body budget:** cap incoming bytes while streaming; do not rely only on Content-Length or client-side file checks. Recommended starter cap: 2 MiB per image.
- **Media checks:** allow JPEG, PNG or WebP only; inspect magic bytes, decode/re-encode in the browser for user experience, reject SVG/HTML and verify final stored type.
- **Quota:** cap total objects and storage per portfolio plus a global account budget; consider strict global counters or administrative control if the project becomes public.
- **Ownership:** random keys, scoped prefixes or metadata bound to the portfolio. Ensure replacing/deleting images cannot affect another portfolio.
- **Security:** same-origin request handling, fixed content types, appropriate cache headers, no secrets in the browser or GitHub.
- **Privacy:** default published images are public; explain this before upload. Strip unnecessary EXIF metadata if re-encoding.
- **Testing:** unauthorised requests, invalid tokens, oversized bodies, invalid magic bytes, quota exhaustion, unavailable bucket, stale URLs and idempotent retries.

## Operational prerequisites

- Confirm the user's existing `fleed-images` bucket is real and usable by the Worker; do not assume from old notes.
- Review R2 Standard free-tier quotas, paid overage exposure and budget guardrails in Cloudflare dashboard.
- Add a named R2 binding only after the account owner approves and has a rollback route.
- Test against a local R2 emulator/binding, then a staging Worker with a test portfolio; merge to production only after security checks.

## References

- https://developers.cloudflare.com/r2/api/workers/workers-api-usage/
- https://developers.cloudflare.com/r2/pricing/
- https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/
- https://developers.cloudflare.com/turnstile/get-started/server-side-validation/

## Why no image upload in this PR

The domain is still routing through a legacy host, the Worker R2 binding is absent, and the account cannot be inspected by the GitHub connector. Shipping a public upload route with no global abuse protections would trade a résumé bullet for an avoidable risk.
