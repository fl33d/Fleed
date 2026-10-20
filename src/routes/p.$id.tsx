import { createFileRoute, Link, notFound } from '@tanstack/react-router'

import { Portfolio } from '@/components/portfolio/Portfolio'
import { Backdrop, ScrollProgress, Wordmark } from '@/components/portfolio/effects'
import { themeProps } from '@/lib/portfolio'
import { getPortfolio } from '@/server/portfolio.functions'

export const Route = createFileRoute('/p/$id')({
  loader: async ({ params }) => {
    const portfolio = await getPortfolio({ data: { id: params.id } })
    if (!portfolio) throw notFound()
    return portfolio
  },
  head: ({ loaderData }) => {
    const title = loaderData
      ? [loaderData.name, loaderData.role].filter(Boolean).join(' — ')
      : 'Portfolio'
    const description = loaderData?.tagline || 'A portfolio made with fleed.'
    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
      ],
    }
  },
  component: PublicPortfolio,
  notFoundComponent: () => (
    <div className="app mode-view min-h-screen grid place-items-center text-center px-6">
      <Backdrop />
      <div className="relative">
        <p className="font-display text-6xl md:text-8xl">Still blank.</p>
        <p className="mt-5 text-sm opacity-50">This page hasn’t been written yet.</p>
        <Link to="/" className="pf-add pf-add-inline mt-10 inline-flex">
          Write your own →
        </Link>
      </div>
    </div>
  ),
})

function PublicPortfolio() {
  const data = Route.useLoaderData()
  return (
    <div className="app mode-view" {...themeProps(data)}>
      {data.theme.backdrop && <Backdrop />}
      <ScrollProgress />
      <Portfolio data={data} editing={false} />
      <Link to="/" className="made-with">
        made with <Wordmark />
      </Link>
    </div>
  )
}
