
import { env } from 'cloudflare:workers'

import type { Portfolio } from '@/lib/portfolio'

const hash = async (token: string): Promise<string> => {
  const bytes = new TextEncoder().encode(token)
  const digest = await crypto.subtle.digest('SHA-256', bytes)

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

const randomHex = (byteLength: number): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength))

  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

const tokensMatch = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false

  let difference = 0
  for (let i = 0; i < a.length; i++) {
    difference |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }

  return difference === 0
}

export const validId = (id: unknown): id is string =>
  typeof id === 'string' && /^[a-z0-9]{6,32}$/.test(id)

type StoredPortfolio = {
  portfolio_json: string
  token_hash: string
  updated_at: string
}

export async function savePortfolio(
  portfolio: Portfolio,
  id?: string,
  token?: string,
): Promise<{ id: string; token: string }> {
  const db = env.fleed_portfolios

  if (validId(id) && typeof token === 'string') {
    const existing = await db
      .prepare(
        'SELECT portfolio_json, token_hash, updated_at FROM portfolios WHERE id = ?',
      )
      .bind(id)
      .first<StoredPortfolio>()

    if (existing && tokensMatch(existing.token_hash, await hash(token))) {
      await db
        .prepare(
          'UPDATE portfolios SET portfolio_json = ?, updated_at = ? WHERE id = ? AND token_hash = ?',
        )
        .bind(
          JSON.stringify(portfolio),
          new Date().toISOString(),
          id,
          existing.token_hash,
        )
        .run()

      return { id, token }
    }
  }

  const newId = randomHex(6)
  const newToken = randomHex(24)

  await db
    .prepare(
      'INSERT INTO portfolios (id, portfolio_json, token_hash, updated_at) VALUES (?, ?, ?, ?)',
    )
    .bind(
      newId,
      JSON.stringify(portfolio),
      await hash(newToken),
      new Date().toISOString(),
    )
    .run()

  return { id: newId, token: newToken }
}

export async function loadPortfolio(
  id: string,
): Promise<Portfolio | null> {
  if (!validId(id)) return null

  const stored = await env.fleed_portfolios
    .prepare('SELECT portfolio_json FROM portfolios WHERE id = ?')
    .bind(id)
    .first<{ portfolio_json: string }>()

  if (!stored) return null

  try {
    return JSON.parse(stored.portfolio_json) as Portfolio
  } catch {
    return null
  }
}
