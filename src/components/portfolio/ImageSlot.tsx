
import { X } from 'lucide-react'

import { cn } from '@/lib/utils'

export function ImageSlot({
  src,
  onChange,
  editing,
  alt,
  className,
  shape = 'wide',
}: {
  src: string
  onChange?: (url: string) => void
  editing: boolean
  alt: string
  className?: string
  shape?: 'wide' | 'portrait' | 'round'
  hint?: string
}) {
  if (!src) return null

  return (
    <figure className={cn('img-frame', `img-${shape}`, className)}>
      <img src={src} alt={alt} loading="lazy" decoding="async" />
      {editing && (
        <div className="img-tools">
          <button
            type="button"
            onClick={() => onChange?.('')}
            aria-label="Remove image"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}
    </figure>
  )
}
