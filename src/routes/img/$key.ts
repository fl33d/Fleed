import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/img/$key')({
  server: {
    handlers: {
      GET: async () =>
        new Response('Image storage is temporarily unavailable.', {
          status: 404,
        }),
    },
  },
})
