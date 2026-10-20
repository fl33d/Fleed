import { useEffect, useRef, useState, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

/** Fades/slides children in once they scroll into view. */
export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = 'div',
}: {
  children: ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'section' | 'li' | 'article'
}) {
  const ref = useRef<HTMLElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { threshold: 0.12 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Tag
      ref={ref as never}
      className={cn('reveal', shown && 'is-in', className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  )
}

/** Splits text into letters that drift in one by one. */
export function SplitText({ text, className }: { text: string; className?: string }) {
  return (
    <span className={cn('split-text', className)} aria-label={text}>
      {text.split(' ').map((word, w, words) => (
        <span key={w} className="inline-block whitespace-nowrap" aria-hidden>
          {word.split('').map((char, i) => {
            const index = words.slice(0, w).join(' ').length + i
            return (
              <span
                key={i}
                className="split-char"
                style={{ animationDelay: `${index * 55}ms` }}
              >
                {char}
              </span>
            )
          })}
          {w < words.length - 1 && <span>&nbsp;</span>}
        </span>
      ))}
    </span>
  )
}

/** Slow, single-line ticker. */
export function Marquee({ items }: { items: string[] }) {
  const row = [...items, ...items, ...items, ...items]
  return (
    <div className="marquee">
      <div className="marquee-track">
        {[0, 1].map((copy) => (
          <div key={copy} className="marquee-group" aria-hidden={copy === 1}>
            {row.map((item, i) => (
              <span key={i} className="marquee-item">
                {item}
                <span className="marquee-sep" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/** An open brush circle. `pathLength` lets CSS draw it with dash offsets. */
export function Enso({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <circle cx="50" cy="50" r="46" pathLength={100} />
    </svg>
  )
}

/** The fleed wordmark. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('brand', className)}>
      fleed<span className="brand-dot">.</span>
    </span>
  )
}

/** A faint ensō that slowly breathes, with a soft glow and paper grain. */
export function Backdrop() {
  return (
    <div className="backdrop" aria-hidden>
      <div className="backdrop-glow" />
      <svg viewBox="0 0 100 100" className="backdrop-enso">
        <circle cx="50" cy="50" r="46" pathLength={100} />
        <circle cx="50" cy="50" r="43" pathLength={100} transform="rotate(140 50 50)" />
      </svg>
      <div className="grain" />
    </div>
  )
}

export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight
      if (ref.current) ref.current.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`
    }
    onScroll()
    addEventListener('scroll', onScroll, { passive: true })
    return () => removeEventListener('scroll', onScroll)
  }, [])
  return <div ref={ref} className="scroll-progress" aria-hidden />
}

export function LiveClock() {
  const [now, setNow] = useState<string>('')
  useEffect(() => {
    const fmt = () =>
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    setNow(fmt())
    const t = setInterval(() => setNow(fmt()), 1000)
    return () => clearInterval(t)
  }, [])
  return <span className="tabular-nums">{now || '--:--:--'}</span>
}
