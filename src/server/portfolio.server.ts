import { getStore } from '@netlify/blobs'
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'

import type { Portfolio } from '@/lib/portfolio'

type StoredPortfolio = {
  portfolio: Portfolio
  tokenHash: string
  updatedAt: string
}

const store = () => getStore({ name: 'portfolios', consistency: 'strong' })
const hash = (token: string) => createHash('sha256').update(token).digest('hex')

export const validId = (id: unknown): id is string =>
  typeof id === 'string' && /^[a-z0-9]{6,32}$/.test(id)

/** Overwrites an existing page when the edit token matches, otherwise creates a new one. */
export async function savePortfolio(
  portfolio: Portfolio,
  id?: string,
  token?: string,
): Promise<{ id: string; token: string }> {
  const blobs = store()

  if (validId(id) && typeof token === 'string') {
    const existing = (await blobs.get(id, { type: 'json' })) as StoredPortfolio | null
    if (
      existing &&
      timingSafeEqual(Buffer.from(existing.tokenHash), Buffer.from(hash(token)))
    ) {
      await blobs.setJSON(id, {
        ...existing,
        portfolio,
        updatedAt: new Date().toISOString(),
      } satisfies StoredPortfolio)
      return { id, token }
    }
  }

  const newId = randomBytes(6).toString('hex')
  const newToken = randomBytes(24).toString('hex')
  await blobs.setJSON(newId, {
    portfolio,
    tokenHash: hash(newToken),
    updatedAt: new Date().toISOString(),
  } satisfies StoredPortfolio)
  return { id: newId, token: newToken }
}

export async function loadPortfolio(id: string): Promise<Portfolio | null> {
  if (!validId(id)) return null
  const stored = (await store().get(id, { type: 'json' })) as StoredPortfolio | null
  return stored ? stored.portfolio : null
}
