import assert from 'node:assert/strict'
import { Client } from '@modelcontextprotocol/client'
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio'

// Exercise the actual MCP stdio handshake and call a real tool, without Cloudflare secrets.
const client = new Client({ name: 'fleed-smoke-test', version: '1.0.0' })
const transport = new StdioClientTransport({
  command: process.execPath,
  args: ['--import', 'tsx', 'src/index.ts'],
  cwd: process.cwd(),
})

try {
  await client.connect(transport)
  const { tools } = await client.listTools()
  const required = ['get_fleed_info', 'get_site_status', 'get_worker_deployment', 'list_database_tables', 'count_portfolios']
  for (const name of required) {
    assert.ok(tools.some((tool) => tool.name === name), 'Missing MCP tool: ' + name)
  }
  const response = await client.callTool({ name: 'get_fleed_info', arguments: {} })
  assert.notEqual(response.isError, true)
  assert.ok(response.content.some((item) => item.type === 'text' && item.text.includes('Cloudflare Workers')))
  console.log('Fleed MCP stdio handshake, tool listing and info tool call passed')
} finally {
  await client.close()
}
