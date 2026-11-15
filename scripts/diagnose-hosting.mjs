// Safe read-only origin diagnostics. Does not log full response bodies or credentials.
import { resolveNs, resolveCname } from 'node:dns/promises'

const targets = [
  'https://fleed.online/',
  'https://www.fleed.online/',
  'https://fleed.store/',
  'https://fleed.fleed.workers.dev/',
  'https://fleed.workers.dev/',
  // A deliberately invalid public portfolio ID safely exercises the read-only D1 route.
  'https://fleed.fleed.workers.dev/p/000000000000',
]

async function inspectURL(url) {
  try {
    const response = await fetch(url, {
      method: 'GET', redirect: 'manual',
      headers: { Accept: 'text/html' },
      signal: AbortSignal.timeout(8000),
    })
    const info = {
      url,
      status: response.status,
      location: response.headers.get('location'),
      server: response.headers.get('server'),
      cf_ray: Boolean(response.headers.get('cf-ray')),
      netlify_request_id: Boolean(response.headers.get('x-nf-request-id')),
      content_type: response.headers.get('content-type'),
    }
    // Discard the body deliberately: only origin diagnostics matter here.
    await response.body?.cancel()
    return info
  } catch (error) {
    return { url, error: error instanceof Error ? error.message : String(error) }
  }
}

async function inspectDNS(host, resolver, recordType) {
  try { return { host, recordType, values: await resolver(host) } }
  catch (error) { return { host, recordType, error: error?.code ?? String(error) } }
}

const [sites, nameservers, wwwCname, workerCname] = await Promise.all([
  Promise.all(targets.map(inspectURL)),
  inspectDNS('fleed.online', resolveNs, 'NS'),
  inspectDNS('www.fleed.online', resolveCname, 'CNAME'),
  inspectDNS('fleed.online', resolveCname, 'CNAME'),
])
console.log(JSON.stringify({
  checked_at: new Date().toISOString(),
  sites,
  dns: [nameservers, wwwCname, workerCname],
  disclaimer: 'HTTP headers are clues, not full proof of all upstream routing; DNS can be cached.',
}, null, 2))
