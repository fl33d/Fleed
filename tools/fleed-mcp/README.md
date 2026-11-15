# Fleed developer MCP server (read-only)

A local TypeScript MCP server for observing Fleed using the official MCP TypeScript SDK v2. This is **developer tooling**, not an AI feature in the public Fleed product.

## Available tools

| Tool | Description | Authentication |
| --- | --- | --- |
| `get_fleed_info` | Static verified source architecture/limitations | None |
| `get_site_status` | Bounded HEAD check of `https://fleed.online/` | None |
| `get_worker_deployment` | Most recent Worker deployment via Cloudflare API | Workers read permission |
| `list_database_tables` | Read-only list of D1 tables | D1 Read |
| `count_portfolios` | Read-only SQL count of portfolios | D1 Read |

Each operation has fixed endpoints or fixed SQL; users cannot execute arbitrary queries, change resources, deploy code, or retrieve portfolio records through these tools.

## Install on your own computer

Requires Node.js 20+ and pnpm:

    pnpm --dir tools/fleed-mcp install
    pnpm --dir tools/fleed-mcp typecheck
    pnpm --dir tools/fleed-mcp start

VS Code's `.vscode/mcp.json` contains a `fleed-local` stdio entry. Start the server through a compatible MCP client rather than expecting terminal output; stdout carries protocol messages.

### Optional access to live Cloudflare data

Set these in your **local environment**, never in repository files:

- `FLEED_CF_ACCOUNT_ID`: Cloudflare account ID.
- `FLEED_CF_API_TOKEN`: API token restricted to necessary **D1 Read** and **Workers Scripts Read/Metadata Read** permissions.
- `FLEED_D1_DATABASE_ID`: the existing D1 database UUID.

Separate tokens for different scopes are safer than one broadly privileged token; if using one, grant only the minimum required permissions. Do not paste keys into chats, issue bodies or terminal transcripts.

Without credentials, `get_fleed_info` and `get_site_status` still work, and privileged tools return a clear error.

## Verification

Run `pnpm --dir tools/fleed-mcp typecheck`, connect it in VS Code, call `get_fleed_info`, then validate authorised calls. If the token lacks permissions, fix the scope rather than supplying a global Cloudflare API key.

This code has not been installed or executed in the current remote audit environment. Do not claim a successful runtime integration until an MCP client has used the tools and returned real responses.

SDK reference: https://ts.sdk.modelcontextprotocol.io/v2/get-started/first-server
Cloudflare API reference: https://developers.cloudflare.com/api/resources/d1/subresources/database/methods/query/
Cloudflare deployments: https://developers.cloudflare.com/api/resources/workers/subresources/scripts/subresources/deployments/methods/list/
