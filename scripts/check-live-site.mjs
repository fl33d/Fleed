// This is a low-impact HTTP smoke test, not a full end-to-end or D1 health check.
const url = 'https://fleed.online/'
const started = Date.now()
try {
  const response = await fetch(url, {
    method: 'GET',
    signal: AbortSignal.timeout(15_000),
    redirect: 'follow',
    headers: { Accept: 'text/html' },
  })
  const body = await response.text()
  const summary = {
    target: url,
    resolvedUrl: response.url,
    status: response.status,
    elapsed_ms: Date.now() - started,
    contains_fleed_branding: /fleed/i.test(body),
    server_header: response.headers.get('server'),
    cloudflare_ray_present: Boolean(response.headers.get('cf-ray')),
    netlify_request_header_present: Boolean(response.headers.get('x-nf-request-id')),
  }
  console.log(JSON.stringify(summary, null, 2))
  if (!response.ok || !summary.contains_fleed_branding) {
    console.error('Fleed smoke check failed. Inspect DNS, Cloudflare Workers Builds and the target response.')
    process.exitCode = 1
  }
} catch (error) {
  console.error('Fleed smoke check failed:', error instanceof Error ? error.message : String(error))
  process.exitCode = 1
}
