import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/upload')({
  server: {
    handlers: {
      POST: async () =>
        Response.json(
          { error: 'Image uploads are temporarily unavailable.' },
          { status: 503 },
        ),
    },
  },
})
