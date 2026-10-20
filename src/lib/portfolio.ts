import type { CSSProperties } from 'react'

export type Project = {
  id: string
  title: string
  description: string
  year: string
  link: string
  image: string
}

export type Experience = {
  id: string
  role: string
  company: string
  period: string
}

export type SocialLink = {
  id: string
  label: string
  url: string
}

/** A section the writer adds themselves: a heading, some prose and an optional image. */
export type CustomSection = {
  id: string
  title: string
  body: string
  image: string
}

export const PALETTES = {
  ink: { label: 'Ink', paper: '#121110', ink: '#e9e5dc' },
  stone: { label: 'Stone', paper: '#1c1d1f', ink: '#e4e2de' },
  moss: { label: 'Moss', paper: '#141813', ink: '#e3e6da' },
  dusk: { label: 'Dusk', paper: '#17141a', ink: '#ebe4e6' },
  paper: { label: 'Paper', paper: '#f1ece2', ink: '#25221d' },
} as const
export type PaletteKey = keyof typeof PALETTES

export const FONTS = {
  serif: { label: 'Serif', family: "'Instrument Serif', serif" },
  sans: { label: 'Grotesk', family: "'Instrument Sans', sans-serif" },
  mono: { label: 'Mono', family: "'JetBrains Mono', monospace" },
} as const
export type FontKey = keyof typeof FONTS

export type Theme = {
  palette: PaletteKey
  font: FontKey
  scale: 'quiet' | 'regular' | 'grand'
  align: 'left' | 'center'
  motion: boolean
  backdrop: boolean
}

export type SectionKey = 'skills' | 'about' | 'work' | 'experience' | 'contact'

/** Headings the writer can rename. */
export type Labels = {
  about: string
  work: string
  experience: string
  contact: string
  ctaTop: string
  ctaBottom: string
}

export const DEFAULT_LABELS: Labels = {
  about: 'About',
  work: 'Selected work',
  experience: 'Experience',
  contact: 'Contact',
  ctaTop: 'Let’s make',
  ctaBottom: 'something.',
}

export const DEFAULT_THEME: Theme = {
  palette: 'ink',
  font: 'serif',
  scale: 'regular',
  align: 'left',
  motion: true,
  backdrop: true,
}

export type Portfolio = {
  name: string
  photo: string
  role: string
  tagline: string
  location: string
  status: string
  about: string
  skills: string[]
  projects: Project[]
  experience: Experience[]
  email: string
  socials: SocialLink[]
  extras: CustomSection[]
  aboutImage: string
  accent: string
  theme: Theme
  labels: Labels
  hidden: SectionKey[]
}

/** Muted, natural tones: sage, clay, mist, sand, blossom, stone. */
export const ACCENTS = [
  '#a9b79c',
  '#d09a7c',
  '#9fb3c1',
  '#d6c29a',
  '#c9a3ab',
  '#b9b3a8',
]

/** The original neon presets, mapped onto their calmer counterparts. */
const ACCENT_MAP: Record<string, string> = {
  '#c6ff3d': ACCENTS[0],
  '#ff5c39': ACCENTS[1],
  '#7c6cff': ACCENTS[4],
  '#38e8ff': ACCENTS[2],
  '#ff4fd8': ACCENTS[4],
  '#ffd23f': ACCENTS[3],
}

const normalizeAccent = (v: unknown) => {
  if (typeof v !== 'string' || !/^#[0-9a-f]{6}$/i.test(v)) return ACCENTS[0]
  return ACCENT_MAP[v.toLowerCase()] ?? v
}

export const uid = () => Math.random().toString(36).slice(2, 10)

export const emptyProject = (): Project => ({
  id: uid(),
  title: '',
  description: '',
  year: '',
  link: '',
  image: '',
})

export const emptyCustomSection = (): CustomSection => ({
  id: uid(),
  title: '',
  body: '',
  image: '',
})

export const emptyExperience = (): Experience => ({
  id: uid(),
  role: '',
  company: '',
  period: '',
})

export const emptySocial = (): SocialLink => ({ id: uid(), label: '', url: '' })

export const blankPortfolio = (): Portfolio => ({
  name: '',
  photo: '',
  role: '',
  tagline: '',
  location: '',
  status: '',
  about: '',
  skills: [],
  projects: [emptyProject()],
  experience: [emptyExperience()],
  email: '',
  socials: [emptySocial()],
  extras: [],
  aboutImage: '',
  accent: ACCENTS[0],
  theme: { ...DEFAULT_THEME },
  labels: { ...DEFAULT_LABELS },
  hidden: [],
})

/** Uploaded images live under /img/<key>; anything else is dropped. */
export function safeImage(raw: unknown): string {
  return typeof raw === 'string' && /^\/img\/[a-z0-9]{16,40}$/.test(raw) ? raw : ''
}

/** Only allow http(s) and mailto links so visitor-facing pages can't carry script URLs. */
export function safeUrl(raw: string): string | undefined {
  const value = raw.trim()
  if (!value) return undefined
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`
  try {
    const url = new URL(withScheme)
    return ['http:', 'https:', 'mailto:'].includes(url.protocol) ? url.href : undefined
  } catch {
    return undefined
  }
}

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '')
const pick = <T extends string>(v: unknown, options: readonly T[], fallback: T): T =>
  options.includes(v as T) ? (v as T) : fallback
const label = (v: unknown, max: number, fallback: string) =>
  typeof v === 'string' ? v.slice(0, max) : fallback
const SECTION_KEYS: SectionKey[] = ['skills', 'about', 'work', 'experience', 'contact']

const list = <T,>(v: unknown, max: number, map: (item: any) => T): T[] =>
  Array.isArray(v) ? v.slice(0, max).map(map) : []

/** Coerces untrusted input into a well-formed Portfolio with length limits. */
export function normalizePortfolio(input: any): Portfolio {
  const p = input ?? {}
  const t = p.theme ?? {}
  const l = p.labels ?? {}
  return {
    name: str(p.name, 80),
    photo: safeImage(p.photo),
    role: str(p.role, 120),
    tagline: str(p.tagline, 280),
    location: str(p.location, 80),
    status: str(p.status, 80),
    about: str(p.about, 3000),
    skills: list(p.skills, 40, (s) => str(s, 40)).filter(Boolean),
    projects: list(p.projects, 24, (x) => ({
      id: str(x?.id, 20) || uid(),
      title: str(x?.title, 120),
      description: str(x?.description, 800),
      year: str(x?.year, 20),
      link: str(x?.link, 400),
      image: safeImage(x?.image),
    })),
    experience: list(p.experience, 24, (x) => ({
      id: str(x?.id, 20) || uid(),
      role: str(x?.role, 120),
      company: str(x?.company, 120),
      period: str(x?.period, 60),
    })),
    email: str(p.email, 200),
    socials: list(p.socials, 12, (x) => ({
      id: str(x?.id, 20) || uid(),
      label: str(x?.label, 40),
      url: str(x?.url, 400),
    })),
    extras: list(p.extras, 12, (x) => ({
      id: str(x?.id, 20) || uid(),
      title: str(x?.title, 120),
      body: str(x?.body, 3000),
      image: safeImage(x?.image),
    })),
    aboutImage: safeImage(p.aboutImage),
    accent: normalizeAccent(p.accent),
    theme: {
      palette: pick(t.palette, Object.keys(PALETTES) as PaletteKey[], DEFAULT_THEME.palette),
      font: pick(t.font, Object.keys(FONTS) as FontKey[], DEFAULT_THEME.font),
      scale: pick(t.scale, ['quiet', 'regular', 'grand'], DEFAULT_THEME.scale),
      align: pick(t.align, ['left', 'center'], DEFAULT_THEME.align),
      motion: typeof t.motion === 'boolean' ? t.motion : DEFAULT_THEME.motion,
      backdrop: typeof t.backdrop === 'boolean' ? t.backdrop : DEFAULT_THEME.backdrop,
    },
    labels: {
      about: label(l.about, 60, DEFAULT_LABELS.about),
      work: label(l.work, 60, DEFAULT_LABELS.work),
      experience: label(l.experience, 60, DEFAULT_LABELS.experience),
      contact: label(l.contact, 60, DEFAULT_LABELS.contact),
      ctaTop: label(l.ctaTop, 60, DEFAULT_LABELS.ctaTop),
      ctaBottom: label(l.ctaBottom, 60, DEFAULT_LABELS.ctaBottom),
    },
    hidden: list(p.hidden, 5, (x) => x).filter((x): x is SectionKey =>
      SECTION_KEYS.includes(x),
    ),
  }
}

/** Attributes and CSS variables for the page wrapper (`.app`). */
export function themeProps(p: Portfolio) {
  const palette = PALETTES[p.theme.palette]
  return {
    'data-palette': p.theme.palette,
    'data-motion': p.theme.motion ? 'on' : 'still',
    style: {
      '--accent-c': p.accent,
      '--paper': palette.paper,
      '--ink': palette.ink,
      '--font-display': FONTS[p.theme.font].family,
    } as CSSProperties,
  }
}
