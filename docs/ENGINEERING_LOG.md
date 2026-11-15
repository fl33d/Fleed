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
