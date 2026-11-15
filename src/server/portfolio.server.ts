
import { env } from 'cloudflare:workers'

import type { Portfolio } from '@/lib/portfolio'
import { classifyEditIntent, hashesMatch, isPortfolioId } from './portfolio-auth'

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

export const validId = isPortfolioId

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

  const intent = classifyEditIntent(id, token)
  if (intent.kind === 'invalid') {
    throw new Error('Edit permission missing or invalid. Your original portfolio was not changed.')
  }

  if (intent.kind === 'update') {
    const existing = await db
      .prepare('SELECT token_hash FROM portfolios WHERE id = ?')
      .bind(intent.id)
      .first<Pick<StoredPortfolio, 'token_hash'>>()

    if (!existing || !hashesMatch(existing.token_hash, await hash(intent.token))) {
      throw new Error('Edit permission missing or invalid. Your original portfolio was not changed.')
    }

    const updated = await db
      .prepare('UPDATE portfolios SET portfolio_json = ?, updated_at = ? WHERE id = ? AND token_hash = ?')
      .bind(JSON.stringify(portfolio), new Date().toISOString(), intent.id, existing.token_hash)
      .run()

    if (!updated.success || updated.meta.changes !== 1) {
      throw new Error('Portfolio update failed. Your original portfolio was not changed.')
    }
    return { id: intent.id, token: intent.token }
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
