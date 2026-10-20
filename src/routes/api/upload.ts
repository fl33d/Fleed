import { createFileRoute } from '@tanstack/react-router'

import { IMAGE_TYPES, MAX_IMAGE_BYTES, saveImage } from '@/server/images.server'

// Accepts a single raw image body and responds with { url }
export const Route = createFileRoute('/api/upload')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const type = (request.headers.get('content-type') ?? '').split(';')[0].trim()
        if (!IMAGE_TYPES.includes(type)) {
          return Response.json({ error: 'Only JPEG, PNG, WebP, GIF or AVIF images.' }, { status: 415 })
        }
        const data = await request.arrayBuffer()
        if (!data.byteLength) return Response.json({ error: 'Empty file.' }, { status: 400 })
        if (data.byteLength > MAX_IMAGE_BYTES) {
          return Response.json({ error: 'Images must be under 5 MB.' }, { status: 413 })
        }
        return Response.json({ url: await saveImage(data, type) })
      },
    },
  },
})
