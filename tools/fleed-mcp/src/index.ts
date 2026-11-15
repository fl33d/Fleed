import { McpServer } from '@modelcontextprotocol/server'
import { serveStdio } from '@modelcontextprotocol/server/stdio'
import * as z from 'zod/v4'

// Developer-only local stdio MCP. This does not run inside the public Fleed Worker.
// Only named, read-only Cloudflare endpoints/SQL statements can be called.
type CloudflareEnvelope = {
  success?: boolean
  errors?: Array<{ message?: string }>
  result?: unknown
}

const asText = (value: unknown) => ({
  content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }],
})

const asError = (error: unknown) => ({
  isError: true as const,
  content: [{ type: 'text' as const, text: error instanceof Error ? error.message : 'Unknown error' }],
})

function credentials() {
  const accountId = process.env.FLEED_CF_ACCOUNT_ID?.trim()
  const token = process.env.FLEED_CF_API_TOKEN?.trim()
  if (!accountId || !token) {
    throw new Error('Set FLEED_CF_ACCOUNT_ID and FLEED_CF_API_TOKEN in your local environment. Do not commit tokens.')
  }
  if (!/^[a-f0-9]{32}$/i.test(accountId)) throw new Error('Invalid Cloudflare account ID format')
  return { accountId, token }
}

async function cloudflare(path: string, body?: { sql: string; params: string[] }): Promise<unknown> {
  const { accountId, token } = credentials()
  const response = await fetch(
    'https://api.cloudflare.com/client/v4/accounts/' + accountId + path,
    {
      method: body ? 'POST' : 'GET',
      headers: {
        Authorization: 'Bearer ' + token,
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(10_000),
    },
  )
  const payload = (await response.json()) as CloudflareEnvelope
  if (!response.ok || !payload.success) {
    const detail = payload.errors?.map((error) => error.message).filter(Boolean).join('; ')
    throw new Error('Cloudflare API request failed (' + response.status + '): ' + (detail || 'unknown error'))
  }
  return payload.result
}

async function queryDatabase(sql: string): Promise<Record<string, unknown>[]> {
  const databaseId = process.env.FLEED_D1_DATABASE_ID?.trim()
  if (!databaseId || !/^[a-f0-9-]{36}$/i.test(databaseId)) {
    throw new Error('Set FLEED_D1_DATABASE_ID to the existing D1 database UUID')
  }
  const result = await cloudflare('/d1/database/' + databaseId + '/query', { sql, params: [] })
  if (!Array.isArray(result)) throw new Error('Unexpected D1 API response')
  return result.flatMap((batch) => {
    if (!batch || typeof batch !== 'object' || !('results' in batch)) return []
    return Array.isArray(batch.results) ? batch.results : []
  }) as Record<string, unknown>[]
}

export function createServer() {
  const server = new McpServer({ name: 'fleed-developer', version: '0.1.0' })

  server.registerTool('get_fleed_info', {
    description: 'Describe the Fleed architecture and the difference between implemented and planned features.',
    inputSchema: z.object({}),
  }, async () => asText({
    project: 'Fleed',
    repository: 'https://github.com/fl33d/Fleed',
    framework: 'React + TypeScript + TanStack Start',
    deployment_target: 'Cloudflare Workers',
    storage: 'Cloudflare D1',
    worker_name: 'fleed',
    known_limitation: 'R2 image uploads are not enabled in the current repository',
    note: 'This is source metadata, not a real-time deployment check',
  }))

  server.registerTool('get_site_status', {
    description: 'Check the public Fleed hostname with a bounded HTTP HEAD request (no user-supplied URLs).',
    inputSchema: z.object({}),
  }, async () => {
    try {
      const started = Date.now()
      const response = await fetch('https://fleed.online/', {
        method: 'HEAD',
        redirect: 'manual',
        signal: AbortSignal.timeout(8_000),
      })
      return asText({ hostname: 'fleed.online', status: response.status,
        healthy_http_response: response.ok, elapsed_ms: Date.now() - started,
        note: 'A successful HTTP response does not prove that publishing and D1 are working' })
    } catch (error) { return asError(error) }
  })

  server.registerTool('get_worker_deployment', {
    description: 'Read the most recent live Cloudflare Worker deployment. Requires a scoped Worker read API token.',
    inputSchema: z.object({}),
  }, async () => {
    try {
      const result = await cloudflare('/workers/scripts/fleed/deployments?per_page=1')
      const deployments = result && typeof result === 'object' && 'deployments' in result
        ? result.deployments : undefined
      const latest = Array.isArray(deployments) ? deployments[0] : undefined
      if (!latest) return asText({ status: 'No deployment returned', note: 'Check token scope and Worker name' })
      return asText({ id: latest.id, created_on: latest.created_on, source: latest.source,
        versions: latest.versions })
    } catch (error) { return asError(error) }
  })

  server.registerTool('list_database_tables', {
    description: 'List user-defined D1 table names without exposing rows. Requires D1 Read permission.',
    inputSchema: z.object({}),
  }, async () => {
    try {
      const rows = await queryDatabase("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
      return asText({ tables: rows.map((row) => row.name) })
    } catch (error) { return asError(error) }
  })

  server.registerTool('count_portfolios', {
    description: 'Count saved portfolios through a fixed read-only D1 SQL query; never returns private portfolio content.',
    inputSchema: z.object({}),
  }, async () => {
    try {
      const rows = await queryDatabase('SELECT COUNT(*) AS count FROM portfolios')
      return asText({ count: rows[0]?.count ?? null })
    } catch (error) { return asError(error) }
  })

  return server
}

// Stdio reserves stdout for the MCP protocol. Never log credentials or debug output to stdout.
serveStdio(createServer)
