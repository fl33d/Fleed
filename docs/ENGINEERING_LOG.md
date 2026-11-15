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
