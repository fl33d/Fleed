# Fleed — technical case study / CV evidence

**Project:** Fleed, a minimal portfolio editor and publisher.
**Repository:** https://github.com/fl33d/Fleed
**Product concept:** create a portfolio by editing the public page itself; preview it before sharing and update the same link later.

## What the source actually demonstrates

- React 19 and TypeScript components for an editable public layout.
- TanStack Start server functions for publish/read and server routes for HTTP handlers.
- Cloudflare Workers execution target and D1 database storage for portfolios.
- Cryptographically generated edit tokens; SHA-256 hashes stored in D1 to authorise updates.
- Browser-side draft autosave and user-selectable visual customisation.

## Engineering work prepared in draft PR #1

- GitHub Actions CI: dependency install, Cloudflare type generation, TypeScript checks, regression tests and production build.
- Local developer TypeScript MCP server with five read-only tools and a tested client/server stdio handshake.
- Scheduled HTTP/DNS/origin checks and Dependabot update PRs.
- Fix for update requests that previously fell back to creating a new portfolio when credentials were invalid.
- Portable JSON draft backup/import that intentionally excludes private edit tokens.
- Architecture, operational documentation and an incident-like domain migration diagnosis.

**Verification boundary:** PR code is NOT merged or deployed until the maintainer approves. CI validates build and tests, not a production end-to-end publish flow.

## Real incident to describe in an interview

**Problem:** The source repository was migrated to Cloudflare, yet the custom domain still returned Netlify response headers.

**Evidence:** Automated checks found HTTP 200 with Netlify origin headers on `fleed.online` while the Cloudflare Workers.dev hostname responded independently with Cloudflare headers. DNS nameservers remained delegated to the legacy provider.

**Diagnosis:** A code deployment migration and an authoritative DNS/custom-domain migration are separate operations.

**Response:** Kept production untouched, built read-only diagnostics and a reproducible migration checklist, documented DNS/SSL/email preservation and rollback steps.

**Status:** Awaiting authorised registrar/Cloudflare cutover; do not claim the domain moved until it actually does.

## CV-ready wording — use only after the PR is merged

> Developed Fleed, a full-stack portfolio builder using React, TypeScript, TanStack Start, Cloudflare Workers and D1, with token-protected portfolio updates and portable drafts. Implemented GitHub Actions regression checks, hosting diagnostics and a read-only TypeScript MCP server for developer tooling.

## More conservative wording — safe today

> Built a portfolio publishing application using React, TypeScript, TanStack Start and Cloudflare Workers/D1. Diagnosed a custom-domain hosting mismatch and prepared a tested automation and MCP tooling improvement branch.

## Do not claim yet

- That `fleed.online` runs on the Cloudflare Worker.
- That user image uploads use R2.
- That the public site integrates Claude, ChatGPT or GPT models.
- That MCP has been authenticated against live Cloudflare account APIs; protocol handshake tests are not equivalent.
- That comprehensive production E2E tests, strict anti-abuse quotas or analytics are operational.

## Interview demonstration checklist

1. Show the repository architecture and explain the difference between local drafts, public portfolio records and edit tokens.
2. Open a GitHub Actions CI run, explain a test and trace a passed build to a commit.
3. Demonstrate a verified Cloudflare Worker page and the hosting-origin diagnostic script.
4. Demonstrate the MCP handshake and tool list; show it only retrieves read-only information.
5. Explain one security trade-off: why unlimited anonymous image uploading is unsafe.
6. Explain the domain incident clearly without claiming it was fully resolved.

Strong engineering is about evidence, trade-offs and controlled changes—not just a long technology list.
