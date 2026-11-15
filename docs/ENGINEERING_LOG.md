# Fleed engineering log

## 2026-11-15 — audit and proposed changes

### Source inspected

- `README.md`, `package.json`, `wrangler.jsonc`, `vite.config.ts`, `src/routes/index.tsx`, `src/routes/p.$id.tsx`, `src/server/portfolio.server.ts`, `src/server/portfolio.functions.ts`, `src/components/portfolio/ImageSlot.tsx`, `src/lib/portfolio.ts`, `src/routes/api/upload.ts`, `src/routes/img/$key.ts`, `AGENTS.md`, `.github/workflows/ci.yml`, `.vscode/mcp.json`, `.gitignore` and repository tree.

### Confirmed

- Worker and D1 integration exist in source.
- Published portfolio pages and local draft autosaving exist.
- Existing CI uses pnpm, Wrangler types, typecheck and Vite build.
- Existing `.vscode/mcp.json` provides Cloudflare MCP; not a Fleed custom server.
- `netlify.toml` remained despite migration and is obsolete.
- Image upload endpoints are disabled and R2 is not bound in Wrangler config.
- README described six palettes; source contains five core palettes.

### Changes in this review branch

- Remove obsolete Netlify configuration and ignore entry.
- Correct README to distinguish verified implementation from planned features.
- Add architecture, release checklist, and this engineering record.
- Add Node regression tests for input normalisation, safe links and image URL validation.
- Execute those tests as part of existing GitHub Actions CI.
- Add a standalone read-only TypeScript MCP development server and optional VS Code configuration (SDK v2, fixed Cloudflare read endpoints and fixed SQL).

### Verification

- GitHub repository source inspected using authenticated connector.
- Public website could not be loaded from the current browsing environment; **no live-site success is claimed**.
- TypeScript dependencies could not be installed or executed in this environment; GitHub CI must verify changed files.
- No production deployment, DNS changes, billing changes, R2 activation, Cloudflare tokens or D1 remote migrations were performed.

### Remaining work

1. Review PR build and test results.
2. Confirm live Cloudflare Workers Build / custom domain settings in dashboard.
3. Design and test secure R2 integration, assuming a bucket and appropriate usage limits are available.
4. Add meaningful image editing/upload UI.
5. Improve update error messages and publish recovery, add integration/e2e tests.
6. Test the MCP server against a scoped Cloudflare API token locally.
7. Review accessibility, responsive layouts, and production security.
8. Add only genuinely useful user-facing AI features; never mislabel marketing claims as functional integrations.

Old Git history will still contain prior Netlify references; removing a tracked file from current code does not rewrite history.

### CI feedback and fix

- Initial PR run 43741370168 **failed in root TypeScript checking** because the root `tsconfig.json` included `tools/fleed-mcp/src/index.ts`, while its standalone SDK packages were not installed at the application root.
- Updated the root `tsconfig.json` to exclude the independently managed MCP package, which has its own TypeScript configuration.
- Await a fresh GitHub Actions run to verify the correction. No claim of success is made before that run completes.

### Automation added to the review branch

- Extended CI to install/typecheck the standalone MCP tool after verifying the web application.
- Added a manual, pull-request and daily (08:17 UTC) live-homepage HTTP smoke check. It checks HTTP success and Fleed branding; it cannot prove D1 writes work.
- Added weekly Dependabot proposals for app dependencies, MCP dependencies and GitHub Actions. These open pull requests rather than deploying dependencies automatically.
- The live website is not yet confirmed from this session; health checks may identify a DNS/Workers deployment problem requiring Cloudflare dashboard access.

### Verified 2026-11-15 CI results

- GitHub Actions `Fleed CI` run 43741781034 **passed** application typecheck, regression tests, build and standalone MCP TypeScript typecheck.
- GitHub Actions `Fleed Live Site Health` run 43741781131 **passed**, returning HTTP 200 from `https://fleed.online/` and Fleed branding in the response.
- Updated outdated checkout/setup-node Action versions to 7 to address Node 20 deprecation warnings.
- Added an end-to-end MCP stdio self-test that spawns the server, negotiates MCP, lists tools and invokes `get_fleed_info`. The result must be checked in the next CI run.
- Added response-header reporting for CF-Ray and Netlify request IDs; these are hints, not full proof of origin hosting.

### CI correction — explicit test discovery

- Commit `925cfd9` failed its first CI run because Node's unqualified `node --test` discovered `tools/fleed-mcp/src/self-test.ts` before the separate MCP dependencies were installed. The 4 portfolio tests passed.
- Changed the website's test script to discover only `tests/*.test.mjs`. MCP tests are run separately after installing that package, keeping independent test suites correctly scoped.

### Verified current checks and hosting mismatch (2026-11-15)

- GitHub Actions `Fleed CI` run 43742200084: **successful** (app tests/build/typecheck and standalone MCP install/typecheck/stdio protocol self-test). The MCP protocol is validated in CI; cloud provider API calls have not been tested using an authenticated token.
- GitHub Actions `Fleed Live Site Health` run 43742200086: HTTP 200, branding found; response header `server: Netlify`, Netlify request ID present, Cloudflare CF-Ray absent. **The custom domain still serves Netlify as of this check.**
- Added read-only DNS/HTTP origin diagnostics for custom and Workers.dev hostnames to identify the likely live Worker before any domain changes.
- Wrote `DOMAIN_CUTOVER.md` with pre-flight checks, approval-dependent dashboard operations, verification and rollback requirements.
- Made legacy-origin detection explicit in routine health logs; use `FLEED_REQUIRE_CLOUDFLARE=1` only after verified cutover to enforce Cloudflare headers.
- No DNS, billing, D1 or production deployment was changed.

### Origin diagnostics: verified 2026-11-15 17:42 UTC

- GitHub Actions health run 43742651116 passed and returned these read-only results:
  - `https://fleed.online/`: HTTP 200, `server: Netlify`, Netlify request header present, CF-Ray absent.
  - `https://www.fleed.online/`: HTTP 301 → `https://fleed.online/`, served by Netlify.
  - `https://fleed.fleed.workers.dev/`: HTTP 200, `server: cloudflare`, CF-Ray present, no Netlify header. **Confirmed active Worker hostname.**
  - `https://fleed.workers.dev/`: fetch failed; **not** the current reachable Worker URL.
  - `https://fleed.store/`: HTTP 200, origin unclear from returned headers.
- DNS `NS` query: `dns1.p04.nsone.net`, `dns2.p04.nsone.net`, `dns3.p04.nsone.net`, `dns4.p04.nsone.net`, demonstrating the domain is not currently delegated to Cloudflare DNS.
- A read-only invalid-portfolio GET against the known Worker URL has been added to the diagnostic script to exercise the public D1 read path; the result is not yet verified.
- **No DNS, domain, remote database, Worker deployment or Netlify changes were performed.**

### Final run 2026-11-15 ~17:45 UTC

- GitHub Actions `Fleed CI` run 43742793959: **success**. Existing app installation, type generation, typechecking, regression tests, production build, standalone MCP install/typecheck and MCP stdio self-test all completed.
- GitHub Actions `Fleed Live Site Health` run 43742793969: **success**. Its diagnostics additionally requested `https://fleed.fleed.workers.dev/p/000000000000` and received HTTP 404 with Cloudflare server and CF-Ray headers — expected for an invalid portfolio ID. This is a non-mutating route check, not proof that database writes or authenticated publishing work.
- PR #1 remains a draft based on `main`. All code/doc automation changes are on `improve/cloudflare-security-mcp-2026-11-15`, not deployed. `fleed.online` still presents Netlify origin headers.

### Portfolio update integrity and user-controlled draft backup — 2026-11-15

- Added a small, testable credential-classification module. Only a request with **both** ID and token absent creates a new portfolio. A partial or invalid credential pair now rejects the update instead of silently creating another public portfolio.
- Updated D1 write flow to verify the stored edit-token hash and confirm one updated row before returning success.
- Added unit tests for create/update intent, invalid credentials and hash comparison.
- Added JSON draft export/import in the editor customisation panel; export intentionally excludes the sensitive published edit token.
- Import requires explicit confirmation. The published page changes only if the user subsequently selects Update.
- Not merged to production; CI must pass before shipping.

### CI follow-up — portable backup UI

- CI run 43750305348 failed TypeScript at `Customize.tsx:71` due to a conflicting `append(...)` signature in the project types. Replaced it with `appendChild(...)`, which has the standard DOM node contract. A fresh CI run must verify the correction.

### Product and release preparation

- Renamed root npm package from the generic `basic` to `fleed` for consistency (deployment Worker name already `fleed`).
- Wrote `docs/PRODUCT_DIRECTION.md`: clear user value, priorities, UX, product boundaries, and optional AI feature criteria.
- Wrote `docs/MEDIA_DESIGN.md`: R2 auth, size/type validation, quotas, anti-abuse and account approval gates. Does not activate storage.
- Wrote `docs/CASE_STUDY.md`: interview/CV-ready evidence with honest unshipped-feature boundaries.
- Added a visible GitHub Actions warning annotation when `fleed.online` still presents Netlify origin headers, without treating basic uptime as failed.
- Current review branch remains draft; no DNS, Worker production deployment, billing, R2 or D1 remote operations performed.

### Final verification before handoff (2026-11-15)

- GitHub Actions `Fleed CI` run **43750996684 passed** after the new edit-token validation, JSON backup UI and npm package name clean-up. Steps included Worker type generation, TypeScript, regression tests, Vite build and MCP stdio test.
- GitHub Actions `Fleed Live Site Health` run **43750996697 passed at HTTP level** but emitted a **GitHub warning** for legacy hosting; `fleed.online` still responds `server: Netlify`, CF-Ray absent. Cloudflare Worker remains reachable via its Workers.dev URL.
- PR #1 updated with accurate claims and linked work items. Issue #4 marked update-credential/UX fixes as implemented on the *draft branch*, with recovery/E2E/abuse controls still pending.
- No merge, production deployment, billed-resource change, DNS edit, R2 activation, secret access or remote D1 operation was performed.
