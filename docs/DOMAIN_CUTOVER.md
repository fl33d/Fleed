# Fleed domain migration: Netlify → Cloudflare Worker

## Evidence from live HTTP, 15 November 2026

GitHub Actions `Fleed Live Site Health` run 43742200086 returned:

```json
{"target":"https://fleed.online/","resolvedUrl":"https://fleed.online/","status":200,"contains_fleed_branding":true,"server_header":"Netlify","cloudflare_ray_present":false,"netlify_request_header_present":true}
```

**Conclusion:** the custom domain `fleed.online` currently returns Netlify-origin response headers, despite this repository being configured for Cloudflare Workers. Repo migration and hostname cutover are different tasks. Do not describe the custom domain as Cloudflare-hosted until verified.

## Confirmed network findings

- `fleed.online`: currently Netlify HTTP 200.
- `www.fleed.online`: Netlify HTTP 301 to the apex hostname.
- `fleed.fleed.workers.dev`: verified Cloudflare HTTP 200 with CF-Ray header.
- `fleed.workers.dev`: not reachable in the diagnostic.
- `fleed.store`: HTTP 200; host origin not verified.
- DNS nameservers: `dns1.p04.nsone.net` through `dns4.p04.nsone.net` (not Cloudflare).

**We have confirmed the Worker is reachable independently. The remaining issue is routing and domain delegation, not the complete absence of a Cloudflare deployment.**

## Diagnosis before changing DNS

1. Review the GitHub Actions `Fleed Live Site Health` logs. `scripts/diagnose-hosting.mjs` tests current hostnames and reads authoritative DNS nameservers. Interpret these as observational data, not DNS config write permissions.
2. In Cloudflare dashboard, confirm the `fleed` Worker and its latest deployed version, and test its actual Workers.dev URL. Do not assume the `workers.dev` account subdomain from memory.
3. Confirm that Worker receives the existing `fleed_portfolios` D1 binding **in production** and can safely read an existing public portfolio. Do not modify or migrate production data.
4. Check Cloudflare zone status for `fleed.online`. If not active in Cloudflare DNS, inspect the current registrar/nameserver configuration, preserve existing records (especially email MX/TXT) and plan the migration before changing anything.
5. Compare `www` and apex; check Cloudflare custom domain routes and any existing Netlify redirects. Plan canonical redirects only after both hostnames work.

## Safe cutover playbook (requires explicit owner approval)

1. Record current DNS, domain settings, Netlify custom domain settings and a rollback plan.
2. Confirm `fleed` Worker is reachable and correctly configured; test `/` and `/p/<id>` on the Worker hostname without exposing portfolio edit tokens.
3. In the Cloudflare dashboard, open Workers & Pages → `fleed` → Settings → Domains & Routes → Add → Custom Domain, selecting `fleed.online` on an **active Cloudflare zone**.
4. Cloudflare may create or adjust DNS/SSL settings. Review changes before confirming. Do not delete unrelated records or switch nameservers as a casual debugging step.
5. Verify TLS, homepage, portfolio read and an authorised test publish/update through the new origin. Use `server`, `cf-ray` and Netlify headers as clues, and cross-check Workers deployment information.
6. Only then remove the old custom domain from Netlify, keeping records/screenshots for rollback.
7. Update documentation and GitHub repo homepage after verified cutover. If the site stops working, revert to the recorded known-good configuration.

## Why this is blocked from this ChatGPT session

The linked GitHub connector can edit repository code, not Cloudflare account domain/DNS settings. No Cloudflare API credentials or dashboard authority are available here. The read-only Fleed MCP server needs a locally authorised Cloudflare token for production deployment checks; no credentials should be pasted into chats.

Cloudflare official docs: https://developers.cloudflare.com/workers/configuration/routing/custom-domains/

## Definition of done

- Cloudflare Worker `fleed` independently responds with the intended code and expected D1 binding.
- `https://fleed.online/` responds correctly with HTTPS from the configured Worker, not legacy Netlify.
- `www` behaviour is intentional, and there are no unintended email/DNS regressions.
- App workflows are tested after cutover and production rollback steps documented.

Do not represent a successful HTTP 200 on the old site as evidence the migration is complete.
