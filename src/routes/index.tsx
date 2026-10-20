import { useEffect, useMemo, useRef, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Check, Copy, Eye, PenLine, RotateCcw, Send } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Customize } from '@/components/portfolio/Customize'
import { Portfolio } from '@/components/portfolio/Portfolio'
import { Backdrop, Enso, ScrollProgress, Wordmark } from '@/components/portfolio/effects'
import {
  blankPortfolio,
  normalizePortfolio,
  themeProps,
  type Portfolio as PortfolioData,
} from '@/lib/portfolio'
import { publishPortfolio } from '@/server/portfolio.functions'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/')({
  component: Editor,
})

// Keys kept from the original "blank." name so existing drafts and edit tokens survive the rename
const DRAFT_KEY = 'blank:draft'
const PUBLISHED_KEY = 'blank:published'
const HINT_KEY = 'blank:hint-dismissed'

type Published = { id: string; token: string }

function completeness(p: PortfolioData) {
  const checks = [
    p.name,
    p.role,
    p.tagline,
    p.about,
    p.skills.length,
    p.projects.some((x) => x.title),
    p.experience.some((x) => x.role),
    p.email || p.socials.some((s) => s.url),
  ]
  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
}

// Hint shown at the top of the editor. Ticking the box, typing anywhere or scrolling
// closes it, and once closed it stays closed in this browser.
function EditBanner() {
  const [state, setState] = useState<'pending' | 'shown' | 'leaving' | 'gone'>('pending')
  const [ticked, setTicked] = useState(false)

  useEffect(() => {
    setState(localStorage.getItem(HINT_KEY) ? 'gone' : 'shown')
  }, [])

  useEffect(() => {
    if (state !== 'shown') return
    const close = () => setState('leaving')
    const onScroll = () => window.scrollY > 24 && close()
    const onInput = (e: Event) => {
      if (!(e.target as Element | null)?.closest?.('.edit-banner')) close()
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('input', onInput)
    return () => {
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('input', onInput)
    }
  }, [state])

  useEffect(() => {
    if (state === 'leaving' || state === 'gone') localStorage.setItem(HINT_KEY, '1')
  }, [state])

  if (state === 'pending' || state === 'gone') return null

  return (
    <div
      className={cn('edit-banner chrome', state === 'leaving' && 'is-leaving')}
      onAnimationEnd={(e) => {
        if (e.animationName === 'drop-out') setState('gone')
      }}
    >
      <span className="edit-banner-dot" />
      Click any line and begin writing. Everything saves as you go.
      <label className="edit-banner-check">
        <input
          type="checkbox"
          checked={ticked}
          onChange={() => {
            setTicked(true)
            setTimeout(() => setState('leaving'), 350)
          }}
        />
        <span className="edit-banner-box">
          <Check className="size-2.5" strokeWidth={3} />
        </span>
        Got it
      </label>
    </div>
  )
}

function Editor() {
  const [data, setData] = useState<PortfolioData>(blankPortfolio)
  const [editing, setEditing] = useState(true)
  const [published, setPublished] = useState<Published | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const loaded = useRef(false)

  // Restore the in-progress draft from this browser
  useEffect(() => {
    try {
      const draft = localStorage.getItem(DRAFT_KEY)
      if (draft) setData(normalizePortfolio(JSON.parse(draft)))
      const pub = localStorage.getItem(PUBLISHED_KEY)
      if (pub) setPublished(JSON.parse(pub))
    } catch {
      // ignore malformed local data
    }
    loaded.current = true
  }, [])

  useEffect(() => {
    if (loaded.current) localStorage.setItem(DRAFT_KEY, JSON.stringify(data))
  }, [data])

  const percent = useMemo(() => completeness(data), [data])
  const shareUrl =
    published && typeof window !== 'undefined' ? `${location.origin}/p/${published.id}` : ''

  const switchMode = (next: boolean) => {
    setEditing(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const publish = async () => {
    if (!data.name.trim()) {
      toast.error('Add your name before publishing.')
      switchMode(true)
      return
    }
    setPublishing(true)
    try {
      const result = await publishPortfolio({
        data: { id: published?.id, token: published?.token, portfolio: data },
      })
      setPublished(result)
      localStorage.setItem(PUBLISHED_KEY, JSON.stringify(result))
      setShareOpen(true)
    } catch {
      toast.error('Publishing failed. Try again in a moment.')
    } finally {
      setPublishing(false)
    }
  }

  const reset = () => {
    if (!confirm('Clear every line and begin again from a blank page?')) return
    setData(blankPortfolio())
    switchMode(true)
  }

  return (
    <div className={cn('app', editing ? 'mode-edit' : 'mode-view')} {...themeProps(data)}>
      <Intro />
      {data.theme.backdrop && <Backdrop />}
      <ScrollProgress />

      {editing && <EditBanner />}

      <div key={editing ? 'edit' : 'view'} className="mode-swap">
        <Portfolio data={data} editing={editing} onChange={setData} />
      </div>

      {/* Floating dock */}
      <div className="dock chrome">
        <div className="dock-toggle" role="tablist" aria-label="Mode">
          <span className={cn('dock-toggle-pill', !editing && 'is-right')} />
          <button role="tab" aria-selected={editing} onClick={() => switchMode(true)}>
            <PenLine className="size-4" /> Edit
          </button>
          <button role="tab" aria-selected={!editing} onClick={() => switchMode(false)}>
            <Eye className="size-4" /> Preview
          </button>
        </div>

        <span className="dock-sep" />

        <Customize data={data} onChange={setData} />

        <div className="dock-progress" title={`${percent}% filled in`}>
          <svg viewBox="0 0 36 36" className="size-9 -rotate-90">
            <circle cx="18" cy="18" r="15" className="dock-ring-bg" />
            <circle
              cx="18"
              cy="18"
              r="15"
              className="dock-ring"
              style={{ strokeDashoffset: 94.25 - (94.25 * percent) / 100 }}
            />
          </svg>
          <span>{percent}</span>
        </div>

        <button className="dock-icon" onClick={reset} aria-label="Start over">
          <RotateCcw className="size-4" />
        </button>

        <button className="dock-publish" onClick={publish} disabled={publishing}>
          <Send className={cn('size-4', publishing && 'animate-pulse')} />
          {publishing ? 'Publishing…' : published ? 'Update' : 'Publish'}
        </button>
      </div>

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="share-dialog">
          <Enso className="share-enso" />
          <DialogHeader>
            <DialogTitle className="font-display text-4xl font-normal">You’re live.</DialogTitle>
            <DialogDescription>
              Anyone with this link sees your portfolio. Keep editing here and hit Update to
              push changes to the same link.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-2">
            <input readOnly value={shareUrl} className="share-input" onFocus={(e) => e.target.select()} />
            <Button
              onClick={async () => {
                await navigator.clipboard.writeText(shareUrl)
                setCopied(true)
                setTimeout(() => setCopied(false), 1600)
              }}
            >
              {copied ? <Check /> : <Copy />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <a href={shareUrl} target="_blank" rel="noreferrer" className="share-open">
            Open live page ↗
          </a>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/** An ensō draws itself around the wordmark, then the whole screen fades away. */
function Intro() {
  const [gone, setGone] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setGone(true), 2700)
    return () => clearTimeout(t)
  }, [])
  if (gone) return null
  return (
    <div className="intro" aria-hidden>
      <div className="intro-mark">
        <Enso />
        <Wordmark className="intro-word" />
      </div>
      <div className="intro-sub">begin with a blank page</div>
    </div>
  )
}
