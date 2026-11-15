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
  if (summary.netlify_request_header_present) {
    console.warn('::warning title=Legacy hosting origin::fleed.online is responding through Netlify, not the intended Cloudflare Worker. See docs/DOMAIN_CUTOVER.md.')
  }
  if (process.env.FLEED_REQUIRE_CLOUDFLARE === '1' && !summary.cloudflare_ray_present) {
    console.error('Cloudflare hosting verification failed: CF-Ray header absent.')
    process.exitCode = 1
  }
  if (!response.ok || !summary.contains_fleed_branding) {
    console.error('Fleed smoke check failed. Inspect DNS, Cloudflare Workers Builds and the target response.')
    process.exitCode = 1
  }
} catch (error) {
  console.error('Fleed smoke check failed:', error instanceof Error ? error.message : String(error))
  process.exitCode = 1
}
