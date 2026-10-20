import { useLayoutEffect, useRef } from 'react'

import { cn } from '@/lib/utils'

/**
 * A text box that looks like the finished typography. Grows with its content,
 * shows a shimmering placeholder while empty and an accent underline on focus.
 */
export function Field({
  value,
  onChange,
  placeholder,
  multiline,
  className,
  label,
  maxLength = 400,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  multiline?: boolean
  className?: string
  label?: string
  maxLength?: number
}) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = '0px'
    el.style.height = `${el.scrollHeight}px`
  }, [value])

  return (
    <span className={cn('field', !value && 'is-empty')}>
      <textarea
        ref={ref}
        rows={1}
        value={value}
        maxLength={maxLength}
        aria-label={label ?? placeholder}
        placeholder={placeholder}
        spellCheck={multiline}
        onChange={(e) =>
          onChange(multiline ? e.target.value : e.target.value.replace(/\n/g, ''))
        }
        onKeyDown={(e) => {
          if (!multiline && e.key === 'Enter') e.preventDefault()
        }}
        className={cn('field-input', className)}
      />
      <span className="field-line" aria-hidden />
    </span>
  )
}
