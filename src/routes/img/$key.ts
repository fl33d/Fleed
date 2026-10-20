import { createFileRoute } from '@tanstack/react-router'

import { loadImage } from '@/server/images.server'

// Serves uploaded images; keys are random and never reused, so they cache forever
export const Route = createFileRoute('/img/$key')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const image = await loadImage(params.key)
        if (!image) return new Response('Not found', { status: 404 })
        return new Response(image.data, {
          headers: {
            'content-type': image.contentType,
            'cache-control': 'public, max-age=31536000, immutable',
            'x-content-type-options': 'nosniff',
          },
        })
      },
    },
  },
})
