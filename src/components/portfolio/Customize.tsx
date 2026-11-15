import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ChevronDown, Download, RotateCcw, SlidersHorizontal, Upload } from 'lucide-react'
import { toast } from 'sonner'

import {
  ACCENTS,
  DEFAULT_LABELS,
  DEFAULT_THEME,
  FONTS,
  PALETTES,
  normalizePortfolio,
  type FontKey,
  type PaletteKey,
  type Portfolio,
  type SectionKey,
  type Theme,
} from '@/lib/portfolio'
import { cn } from '@/lib/utils'

const SECTIONS: { key: SectionKey; label: string }[] = [
  { key: 'skills', label: 'Skills ticker' },
  { key: 'about', label: 'About' },
  { key: 'work', label: 'Work' },
  { key: 'experience', label: 'Experience' },
  { key: 'contact', label: 'Contact' },
]

/** The dock's "Customise" button and the panel that unfolds above it. */
export function Customize({
  data,
  onChange,
}: {
  data: Portfolio
  onChange: (fn: (d: Portfolio) => Portfolio) => void
}) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const backupInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const theme = data.theme
  const setTheme = <K extends keyof Theme>(key: K, value: Theme[K]) =>
    onChange((d) => ({ ...d, theme: { ...d.theme, [key]: value } }))
  const toggleSection = (key: SectionKey) =>
    onChange((d) => ({
      ...d,
      hidden: d.hidden.includes(key) ? d.hidden.filter((k) => k !== key) : [...d.hidden, key],
    }))
  const isCustomAccent = !ACCENTS.includes(data.accent)

  const downloadBackup = () => {
    // Deliberately exclude the edit token, which must not be exposed in portable data.
    const blob = new Blob([JSON.stringify(normalizePortfolio(data), null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'fleed-portfolio-backup.json'
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    toast.success('Draft downloaded as JSON.')
  }

  const importBackup = async (file?: File) => {
    if (!file) return
    if (file.size > 256_000) {
      toast.error('Backup too large (256 KB maximum).')
      return
    }
    try {
      const parsed: unknown = JSON.parse(await file.text())
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) ||
          !('name' in parsed) || typeof parsed.name !== 'string' ||
          !('projects' in parsed) || !Array.isArray(parsed.projects)) {
        throw new Error('Not a Fleed portfolio backup')
      }
      if (!window.confirm('Replace this draft with the selected backup? Your published page will change only if you press Update.')) return
      onChange(() => normalizePortfolio(parsed))
      toast.success('Draft imported. Review it before publishing.')
    } catch {
      toast.error('This file is not a valid Fleed portfolio backup.')
    }
  }

  return (
    <div ref={root} className="cz">
      <button
        className={cn('cz-trigger', open && 'is-open')}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <SlidersHorizontal className="size-4" />
        <span className="cz-trigger-label">Customise</span>
        <span className="cz-trigger-dot" />
        <ChevronDown className="size-3.5 cz-chevron" />
      </button>

      {open && (
        <div className="cz-panel" role="dialog" aria-label="Customise">
          <Group title="Tone">
            <div className="cz-palettes">
              {(Object.keys(PALETTES) as PaletteKey[]).map((key) => {
                const p = PALETTES[key]
                return (
                  <button
                    key={key}
                    className={cn('cz-palette', theme.palette === key && 'is-active')}
                    onClick={() => setTheme('palette', key)}
                    style={{ background: p.paper, color: p.ink }}
                  >
                    <span className="cz-palette-aa">Aa</span>
                    <span className="cz-palette-name">{p.label}</span>
                  </button>
                )
              })}
            </div>
          </Group>

          <Group title="Accent">
            <div className="cz-accents">
              {ACCENTS.map((c) => (
                <button
                  key={c}
                  aria-label={`Accent ${c}`}
                  onClick={() => onChange((d) => ({ ...d, accent: c }))}
                  className={cn('cz-accent', data.accent === c && 'is-active')}
                  style={{ background: c }}
                />
              ))}
              <label
                className={cn('cz-accent cz-accent-custom', isCustomAccent && 'is-active')}
                style={isCustomAccent ? { background: data.accent } : undefined}
                title="Pick any colour"
              >
                <input
                  type="color"
                  value={data.accent}
                  onChange={(e) => onChange((d) => ({ ...d, accent: e.target.value }))}
                  aria-label="Custom accent colour"
                />
              </label>
            </div>
          </Group>

          <Group title="Typeface">
            <div className="cz-fonts">
              {(Object.keys(FONTS) as FontKey[]).map((key) => (
                <button
                  key={key}
                  className={cn('cz-font', theme.font === key && 'is-active')}
                  onClick={() => setTheme('font', key)}
                >
                  <span style={{ fontFamily: FONTS[key].family }}>Aa</span>
                  <small>{FONTS[key].label}</small>
                </button>
              ))}
            </div>
          </Group>

          <div className="cz-row">
            <Group title="Scale">
              <Segmented
                value={theme.scale}
                options={[
                  ['quiet', 'Quiet'],
                  ['regular', 'Regular'],
                  ['grand', 'Grand'],
                ]}
                onChange={(v) => setTheme('scale', v)}
              />
            </Group>
            <Group title="Align">
              <Segmented
                value={theme.align}
                options={[
                  ['left', 'Left'],
                  ['center', 'Centre'],
                ]}
                onChange={(v) => setTheme('align', v)}
              />
            </Group>
          </div>

          <Group title="Sections">
            <div className="cz-toggles">
              {SECTIONS.map((s) => (
                <Toggle
                  key={s.key}
                  label={s.label}
                  checked={!data.hidden.includes(s.key)}
                  onChange={() => toggleSection(s.key)}
                />
              ))}
            </div>
          </Group>

          <Group title="Atmosphere">
            <div className="cz-toggles">
              <Toggle
                label="Ensō backdrop"
                checked={theme.backdrop}
                onChange={() => setTheme('backdrop', !theme.backdrop)}
              />
              <Toggle
                label="Gentle motion"
                checked={theme.motion}
                onChange={() => setTheme('motion', !theme.motion)}
              />
            </div>
          </Group>

          <Group title="Draft backup">
            <div className="flex flex-col gap-1">
              <button type="button" className="cz-reset" onClick={downloadBackup}>
                <Download className="size-3" /> Download JSON backup
              </button>
              <button type="button" className="cz-reset" onClick={() => backupInput.current?.click()}>
                <Upload className="size-3" /> Import JSON backup
              </button>
              <input
                ref={backupInput}
                type="file"
                accept="application/json,.json"
                className="hidden"
                aria-label="Choose a Fleed portfolio JSON backup"
                onChange={async (event) => {
                  const file = event.currentTarget.files?.[0]
                  event.currentTarget.value = ''
                  await importBackup(file)
                }}
              />
              <p className="text-xs opacity-50 leading-relaxed">
                Backups contain your portfolio content, not the private edit token needed to update an existing published link.
              </p>
            </div>
          </Group>
          <button
            className="cz-reset"
            onClick={() =>
              onChange((d) => ({
                ...d,
                theme: { ...DEFAULT_THEME },
                labels: { ...DEFAULT_LABELS },
                hidden: [],
                accent: ACCENTS[0],
              }))
            }
          >
            <RotateCcw className="size-3" /> Restore defaults
          </button>
        </div>
      )}
    </div>
  )
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="cz-group">
      <div className="cz-title">{title}</div>
      {children}
    </div>
  )
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: [T, string][]
  onChange: (value: T) => void
}) {
  return (
    <div className="cz-seg" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map(([key, label]) => (
        <button
          key={key}
          className={cn(value === key && 'is-active')}
          aria-pressed={value === key}
          onClick={() => onChange(key)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <button role="switch" aria-checked={checked} className="cz-toggle" onClick={onChange}>
      <span>{label}</span>
      <span className="cz-switch" />
    </button>
  )
}
