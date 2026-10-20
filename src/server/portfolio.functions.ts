import { createServerFn } from '@tanstack/react-start'

import { normalizePortfolio } from '@/lib/portfolio'
import { loadPortfolio, savePortfolio } from './portfolio.server'

export const publishPortfolio = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: { id?: string; token?: string; portfolio: unknown }) => data,
  )
  .handler(({ data }) =>
    savePortfolio(normalizePortfolio(data.portfolio), data.id, data.token),
  )

export const getPortfolio = createServerFn({ method: 'GET' })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const portfolio = await loadPortfolio(data.id)
    return portfolio ? normalizePortfolio(portfolio) : null
  })
