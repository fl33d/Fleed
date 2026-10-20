import { getStore } from '@netlify/blobs'
import { randomBytes } from 'node:crypto'

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']

const store = () => getStore('images')

export const validImageKey = (key: unknown): key is string =>
  typeof key === 'string' && /^[a-z0-9]{16,40}$/.test(key)

/** Stores an uploaded image and returns its public path. */
export async function saveImage(data: ArrayBuffer, contentType: string): Promise<string> {
  const key = randomBytes(12).toString('hex')
  await store().set(key, data, { metadata: { contentType } })
  return `/img/${key}`
}

export async function loadImage(key: string) {
  if (!validImageKey(key)) return null
  const result = await store().getWithMetadata(key, { type: 'arrayBuffer' })
  if (!result) return null
  const contentType = String(result.metadata.contentType ?? '')
  return { data: result.data, contentType: IMAGE_TYPES.includes(contentType) ? contentType : 'application/octet-stream' }
}
