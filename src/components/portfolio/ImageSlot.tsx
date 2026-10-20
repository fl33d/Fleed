import { useRef, useState, type DragEvent } from 'react'
import { ImagePlus, RefreshCw, X } from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'

const MAX_EDGE = 2000

/** Shrinks large photos in the browser so uploads stay small. GIFs pass through untouched. */
async function prepare(file: File): Promise<Blob> {
  if (file.type === 'image/gif' || file.size < 400 * 1024) return file
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/webp', 0.86))
    return blob && blob.size < file.size ? blob : file
  } catch {
    return file
  }
}

async function upload(file: File): Promise<string> {
  const body = await prepare(file)
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'content-type': body.type || file.type },
    body,
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || !json.url) throw new Error(json.error ?? 'Upload failed.')
  return json.url
}

/**
 * An image the writer can add, swap or remove. While empty in edit mode it's a quiet
 * "Add image" pill that surfaces when its section is hovered; in view mode it renders
 * only when an image exists.
 */
export function ImageSlot({
  src,
  onChange,
  editing,
  alt,
  className,
  shape = 'wide',
  hint = 'Add image',
}: {
  src: string
  onChange?: (url: string) => void
  editing: boolean
  alt: string
  className?: string
  shape?: 'wide' | 'portrait' | 'round'
  hint?: string
}) {
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [over, setOver] = useState(false)

  if (!editing && !src) return null

  const choose = async (file?: File | null) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.error('That file isn’t an image.')
    setBusy(true)
    try {
      onChange?.(await upload(file))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed.')
    } finally {
      setBusy(false)
    }
  }

  const picker = editing && (
    <input
      ref={input}
      type="file"
      accept="image/*"
      hidden
      onChange={(e) => {
        choose(e.target.files?.[0])
        e.target.value = ''
      }}
    />
  )

  const dropProps = editing
    ? {
        onDragOver: (e: DragEvent) => {
          e.preventDefault()
          setOver(true)
        },
        onDragLeave: () => setOver(false),
        onDrop: (e: DragEvent) => {
          e.preventDefault()
          setOver(false)
          choose(e.dataTransfer.files?.[0])
        },
      }
    : {}

  if (!src) {
    return (
      <div className={cn('img-empty', `img-${shape}`, over && 'is-over', className)} {...dropProps}>
        {picker}
        <button type="button" className="img-add" onClick={() => input.current?.click()} disabled={busy}>
          <ImagePlus className="size-3.5" />
          {busy ? 'Uploading…' : hint}
        </button>
      </div>
    )
  }

  return (
    <figure className={cn('img-frame', `img-${shape}`, busy && 'is-busy', over && 'is-over', className)} {...dropProps}>
      {picker}
      <img src={src} alt={alt} loading="lazy" decoding="async" />
      {editing && (
        <div className="img-tools">
          <button type="button" onClick={() => input.current?.click()} aria-label="Replace image">
            <RefreshCw className="size-3.5" />
          </button>
          <button type="button" onClick={() => onChange?.('')} aria-label="Remove image">
            <X className="size-3.5" />
          </button>
        </div>
      )}
    </figure>
  )
}
