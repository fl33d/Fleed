# Fleed

**A calm, editable portfolio builder — powered by Cloudflare Workers and D1.**

Fleed is a full-stack web application for creating, previewing and publishing personal portfolios directly on the page, with no complicated dashboard.

**Public project:** https://github.com/fl33d/Fleed
**Intended custom domain:** https://fleed.online/ (check the live deployment independently)

## Working features

- In-place editing for identity, skills, projects, experience, contact details and custom sections.
- Browser-saved drafts; separate visitor preview and editor views.
- Five core colour palettes, multiple typography choices and adjustable layout.
- Shareable published portfolio links (`/p/<id>`).
- Cloudflare D1 persistence with SHA-256-hashed edit credentials for subsequent updates.
- Responsive React interface with accessibility and reduced-motion considerations.

## Current limitations

- **Photo uploads are disabled:** the upload endpoint returns 503 and the image endpoint returns 404. R2 is not yet configured in `wrangler.jsonc`.
- **Do not imply an AI feature exists:** MCP tooling in `tools/fleed-mcp/` is a developer-facing read-only integration; it does not generate portfolio content.
- The production custom-domain/DNS status cannot be verified from the source repository alone.

## Tech stack

| Layer | Technology |
| --- | --- |
| Web UI | React 19, TypeScript, Tailwind CSS 4 |
| Full-stack framework | TanStack Start + Router |
| Build | Vite, pnpm |
| Runtime | Cloudflare Workers |
| Database | Cloudflare D1 (SQLite) |
| CI | GitHub Actions: dependency install, Wrangler type generation, tests, typecheck, build |
| Deployment | Cloudflare Workers Builds (Git integration on `main`) |
| Development integrations | Cloudflare MCP in VS Code; standalone local Fleed MCP server |

## Local development

Install Node.js and pnpm:

    pnpm install --frozen-lockfile
    pnpm dev

Checks:

    pnpm exec wrangler types
    pnpm test
    pnpm typecheck
    pnpm build

Wrangler configuration lives in `wrangler.jsonc`. Production D1 is **not** your local database; local Wrangler development uses local state by default. Never apply migrations remotely without verifying backups and impact.

## Architecture and operations

- [System architecture](docs/ARCHITECTURE.md)
- [Engineering log and decisions](docs/ENGINEERING_LOG.md)
- [Release and deployment checklist](docs/OPERATIONS.md)
- [Read-only Fleed MCP development tools](tools/fleed-mcp/README.md)

## Security and limitations

Edit tokens are generated randomly and only their hashes are stored in D1. Browser storage keeps the token used to update a published portfolio, so clearing browser storage may lose access. No accounts or recovery flow exist yet. Public link fields are checked for safe protocols, and uploaded-image URLs are restricted to an internal `/img/<key>` pattern.

Fleed is a learning project under active development. Features and third-party integrations are documented accurately rather than presented as complete before they are tested.
