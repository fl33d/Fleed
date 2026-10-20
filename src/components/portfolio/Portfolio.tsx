import { useEffect, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react'
import { useLocation } from '@tanstack/react-router'
import { ArrowUpRight, Plus, X } from 'lucide-react'

import {
  emptyCustomSection,
  emptyExperience,
  emptyProject,
  emptySocial,
  safeUrl,
  type Labels,
  type Portfolio as PortfolioData,
} from '@/lib/portfolio'
import { cn } from '@/lib/utils'
import { Field } from './Field'
import { ImageSlot } from './ImageSlot'
import { LiveClock, Marquee, Reveal, SplitText } from './effects'

type Props = {
  data: PortfolioData
  editing: boolean
  onChange?: (next: PortfolioData) => void
}

export function Portfolio({ data, editing, onChange }: Props) {
  const set = <K extends keyof PortfolioData>(key: K, value: PortfolioData[K]) =>
    onChange?.({ ...data, [key]: value })

  type ListKey = 'projects' | 'experience' | 'socials' | 'extras'

  const updateItem = <K extends ListKey>(
    key: K,
    id: string,
    patch: Partial<PortfolioData[K][number]>,
  ) =>
    set(
      key,
      (data[key] as PortfolioData[K][number][]).map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ) as PortfolioData[K],
    )

  const removeItem = <K extends ListKey>(key: K, id: string) =>
    set(key, (data[key] as { id: string }[]).filter((i) => i.id !== id) as PortfolioData[K])

  const projects = editing ? data.projects : data.projects.filter((p) => p.title || p.description)
  const experience = editing ? data.experience : data.experience.filter((e) => e.role || e.company)
  const socials = editing ? data.socials : data.socials.filter((s) => s.label && safeUrl(s.url))
  const extras = editing ? data.extras : data.extras.filter((x) => x.title || x.body || x.image)
  const shown = (key: PortfolioData['hidden'][number]) => !data.hidden.includes(key)
  const setLabel = (key: keyof Labels, value: string) => set('labels', { ...data.labels, [key]: value })
  const labels = data.labels
  const initials =
    data.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('') || '○'
  const hasContact = !!data.email || socials.length > 0

  const showAbout = shown('about') && (editing || !!data.about || !!data.aboutImage)
  const showWork = shown('work') && (editing || projects.length > 0)
  const showExperience = shown('experience') && (editing || experience.length > 0)
  const showContact = shown('contact') && (editing || hasContact)

  const nav = [
    { id: 'about', label: labels.about || 'About', show: showAbout },
    { id: 'work', label: 'Work', show: showWork },
    { id: 'experience', label: labels.experience || 'Experience', show: showExperience },
    { id: 'contact', label: labels.contact || 'Contact', show: showContact },
  ].filter((n) => n.show)

  // Old shared links may still carry #top and friends; tidy them away
  useEffect(() => {
    if (location.hash) history.replaceState(history.state, '', location.pathname + location.search)
  }, [])

  let section = 0
  const nextNumber = () => String(++section).padStart(2, '0')

  return (
    <div
      className="portfolio"
      data-font={data.theme.font}
      data-scale={data.theme.scale}
      data-align={data.theme.align}
      style={{ '--accent-c': data.accent } as CSSProperties}
    >
      <header className="pf-nav">
        <ScrollLink to="top" className="pf-mono-badge" aria-label="Back to top">
          <span>{initials}</span>
        </ScrollLink>
        <nav className="hidden md:flex gap-9">
          {nav.map((n) => (
            <ScrollLink key={n.id} to={n.id} className="pf-nav-link">
              {n.label}
            </ScrollLink>
          ))}
        </nav>
        <div className="pf-meta">
          {data.location && <span>{data.location}</span>}
          <LiveClock />
        </div>
      </header>

      {/* Hero */}
      <section id="top" className={cn('pf-hero slot-host', data.photo && 'has-photo')}>
        <div className="pf-hero-main">
        {(editing || data.status) && (
          <Reveal delay={100}>
            <div className="pf-status">
              <span className="pf-pulse" />
              {editing ? (
                <Field
                  value={data.status}
                  onChange={(v) => set('status', v)}
                  placeholder="Status — e.g. open to work"
                  maxLength={80}
                />
              ) : (
                data.status
              )}
            </div>
          </Reveal>
        )}

        <h1 className="pf-name">
          {editing ? (
            <Field
              value={data.name}
              onChange={(v) => set('name', v)}
              placeholder="Your name"
              label="Name"
              maxLength={80}
            />
          ) : data.name ? (
            <SplitText key={data.name} text={data.name} />
          ) : (
            <span className="opacity-30">Untitled</span>
          )}
        </h1>

        <div className="pf-hero-row">
          <Reveal delay={350} className="pf-role">
            {editing ? (
              <Field
                value={data.role}
                onChange={(v) => set('role', v)}
                placeholder="What you do"
                label="Role"
                maxLength={120}
              />
            ) : (
              data.role
            )}
          </Reveal>
          <Reveal delay={500} className="pf-tagline">
            {editing ? (
              <Field
                value={data.tagline}
                onChange={(v) => set('tagline', v)}
                placeholder="A one-line hook. What makes your work worth a look?"
                label="Tagline"
                maxLength={280}
                multiline
              />
            ) : (
              data.tagline
            )}
          </Reveal>
        </div>

        {editing && (
          <Reveal delay={600} className="pf-inline-meta">
            <span className="pf-label">Based in</span>
            <Field
              value={data.location}
              onChange={(v) => set('location', v)}
              placeholder="City, Country"
              label="Location"
              maxLength={80}
            />
          </Reveal>
        )}

        </div>

        <Reveal delay={300} className="pf-hero-photo">
          <ImageSlot
            src={data.photo}
            onChange={(v) => set('photo', v)}
            editing={editing}
            alt={data.name || 'Portrait'}
            shape="portrait"
            hint="Add a portrait"
          />
        </Reveal>

        <ScrollLink to={nav[0]?.id ?? 'top'} className="pf-scroll">
          <span className="pf-scroll-line" />
          Scroll
        </ScrollLink>
      </section>

      {/* Skills */}
      {shown('skills') &&
        (editing ? (
          <SkillEditor skills={data.skills} onChange={(s) => set('skills', s)} />
        ) : (
          data.skills.length > 0 && (
            <div className="pf-marquees">
              <Marquee items={data.skills} />
            </div>
          )
        ))}

      {/* About */}
      {showAbout && (
        <Section
          id="about"
          number={nextNumber()}
          title={labels.about}
          editing={editing}
          onTitle={(v) => setLabel('about', v)}
        >
          <div className={cn('pf-about-wrap slot-host', data.aboutImage && 'has-image')}>
          <Reveal className="pf-about">
            {editing ? (
              <Field
                value={data.about}
                onChange={(v) => set('about', v)}
                placeholder="Tell your story. Where you started, what you obsess over, what you're building next…"
                label="About"
                maxLength={3000}
                multiline
              />
            ) : (
              data.about.split(/\n{2,}/).map((para, i) => <p key={i}>{para}</p>)
            )}
          </Reveal>
          <Reveal delay={150} className="pf-about-image">
            <ImageSlot
              src={data.aboutImage}
              onChange={(v) => set('aboutImage', v)}
              editing={editing}
              alt={labels.about}
              shape="portrait"
            />
          </Reveal>
          </div>
        </Section>
      )}

      {/* Work */}
      {showWork ? (
        <Section
          id="work"
          number={nextNumber()}
          title={labels.work}
          editing={editing}
          onTitle={(v) => setLabel('work', v)}
        >
          <div className="pf-works">
            {projects.map((p, i) => {
              const href = safeUrl(p.link)
              return (
                <Reveal
                  key={p.id}
                  delay={Math.min(i, 4) * 80}
                  as="article"
                  className="pf-work slot-host"
                >
                  <span className="pf-work-index">{String(i + 1).padStart(2, '0')}</span>
                  <div className="pf-work-body">
                    <h3 className="pf-work-title">
                      {editing ? (
                        <Field
                          value={p.title}
                          onChange={(v) => updateItem('projects', p.id, { title: v })}
                          placeholder="Project title"
                          maxLength={120}
                        />
                      ) : (
                        p.title
                      )}
                    </h3>
                    <ImageSlot
                      src={p.image}
                      onChange={(v) => updateItem('projects', p.id, { image: v })}
                      editing={editing}
                      alt={p.title || 'Project image'}
                      className="pf-work-image"
                      hint="Add a cover image"
                    />
                    {(editing || p.description) && (
                      <div className="pf-work-desc">
                        {editing ? (
                          <Field
                            value={p.description}
                            onChange={(v) => updateItem('projects', p.id, { description: v })}
                            placeholder="What was it, what was your part, what happened?"
                            maxLength={800}
                            multiline
                          />
                        ) : (
                          p.description
                        )}
                      </div>
                    )}
                    <div className="pf-work-foot">
                      {editing ? (
                        <>
                          <span className="flex-1 max-w-sm">
                            <Field
                              value={p.link}
                              onChange={(v) => updateItem('projects', p.id, { link: v })}
                              placeholder="Link (optional)"
                              maxLength={400}
                            />
                          </span>
                          <RemoveButton onClick={() => removeItem('projects', p.id)} />
                        </>
                      ) : (
                        href && (
                          <a href={href} target="_blank" rel="noreferrer" className="pf-link">
                            View project <ArrowUpRight className="size-3.5" />
                          </a>
                        )
                      )}
                    </div>
                  </div>
                  <span className="pf-work-year">
                    {editing ? (
                      <Field
                        value={p.year}
                        onChange={(v) => updateItem('projects', p.id, { year: v })}
                        placeholder="Year"
                        maxLength={20}
                      />
                    ) : (
                      p.year
                    )}
                  </span>
                </Reveal>
              )
            })}
          </div>
          {editing && (
            <AddButton
              className="pf-add-inline"
              onClick={() => set('projects', [...data.projects, emptyProject()])}
            >
              Add project
            </AddButton>
          )}
        </Section>
      ) : null}

      {/* Experience */}
      {showExperience ? (
        <Section
          id="experience"
          number={nextNumber()}
          title={labels.experience}
          editing={editing}
          onTitle={(v) => setLabel('experience', v)}
        >
          <ul className="pf-timeline">
            {experience.map((e, i) => (
              <Reveal key={e.id} as="li" delay={i * 80} className="pf-row">
                <div className="pf-row-role">
                  {editing ? (
                    <Field
                      value={e.role}
                      onChange={(v) => updateItem('experience', e.id, { role: v })}
                      placeholder="Role"
                      maxLength={120}
                    />
                  ) : (
                    e.role
                  )}
                </div>
                <div className="pf-row-company">
                  {editing ? (
                    <Field
                      value={e.company}
                      onChange={(v) => updateItem('experience', e.id, { company: v })}
                      placeholder="Company / Client"
                      maxLength={120}
                    />
                  ) : (
                    e.company
                  )}
                </div>
                <div className="pf-row-period">
                  {editing ? (
                    <Field
                      value={e.period}
                      onChange={(v) => updateItem('experience', e.id, { period: v })}
                      placeholder="2022 — Now"
                      maxLength={60}
                    />
                  ) : (
                    e.period
                  )}
                </div>
                {editing && <RemoveButton onClick={() => removeItem('experience', e.id)} />}
              </Reveal>
            ))}
          </ul>
          {editing && (
            <AddButton
              className="pf-add-inline"
              onClick={() => set('experience', [...data.experience, emptyExperience()])}
            >
              Add experience
            </AddButton>
          )}
        </Section>
      ) : null}

      {/* Sections the writer added themselves */}
      {extras.map((x) => (
        <Section
          key={x.id}
          id={`section-${x.id}`}
          number={nextNumber()}
          title={x.title}
          editing={editing}
          onTitle={(v) => updateItem('extras', x.id, { title: v })}
          titlePlaceholder="Section title"
          onRemove={() => removeItem('extras', x.id)}
        >
          <div className={cn('pf-about-wrap slot-host', x.image && 'has-image')}>
            {(editing || x.body) && (
              <Reveal className="pf-extra-body">
                {editing ? (
                  <Field
                    value={x.body}
                    onChange={(v) => updateItem('extras', x.id, { body: v })}
                    placeholder="Anything you like: a manifesto, awards, a reading list, a note to visitors…"
                    maxLength={3000}
                    multiline
                  />
                ) : (
                  x.body.split(/\n{2,}/).map((para, i) => <p key={i}>{para}</p>)
                )}
              </Reveal>
            )}
            <Reveal delay={150} className="pf-about-image">
              <ImageSlot
                src={x.image}
                onChange={(v) => updateItem('extras', x.id, { image: v })}
                editing={editing}
                alt={x.title || 'Section image'}
                shape="wide"
              />
            </Reveal>
          </div>
        </Section>
      ))}

      {editing && data.extras.length < 12 && (
        <div className="pf-add-section">
          <AddButton onClick={() => set('extras', [...data.extras, emptyCustomSection()])}>
            Add a section of your own
          </AddButton>
        </div>
      )}

      {/* Contact */}
      {showContact && (
        <Section
          id="contact"
          number={nextNumber()}
          title={labels.contact}
          editing={editing}
          onTitle={(v) => setLabel('contact', v)}
        >
          <Reveal>
            <p className="pf-cta">
              {editing ? (
                <>
                  <Field
                    value={labels.ctaTop}
                    onChange={(v) => setLabel('ctaTop', v)}
                    placeholder="Let’s make"
                    label="Closing line"
                    maxLength={60}
                  />
                  <em>
                    <Field
                      value={labels.ctaBottom}
                      onChange={(v) => setLabel('ctaBottom', v)}
                      placeholder="something."
                      label="Closing line, emphasised"
                      maxLength={60}
                    />
                  </em>
                </>
              ) : (
                <>
                  {labels.ctaTop}
                  {labels.ctaTop && labels.ctaBottom && <br />}
                  <em>{labels.ctaBottom}</em>
                </>
              )}
            </p>
          </Reveal>
          <Reveal delay={150} className="mt-12">
            {editing ? (
              <div className="pf-email-edit">
                <Field
                  value={data.email}
                  onChange={(v) => set('email', v)}
                  placeholder="you@email.com"
                  label="Email"
                  maxLength={200}
                />
              </div>
            ) : (
              data.email && (
                <a href={`mailto:${data.email}`} className="pf-email">
                  <span>{data.email}</span>
                  <ArrowUpRight className="size-5" />
                </a>
              )
            )}
          </Reveal>
          <div className="pf-socials">
            {socials.map((s, i) => (
              <Reveal key={s.id} delay={200 + i * 60}>
                {editing ? (
                  <div className="pf-social-edit">
                    <span className="w-32">
                      <Field
                        value={s.label}
                        onChange={(v) => updateItem('socials', s.id, { label: v })}
                        placeholder="Label"
                        maxLength={40}
                      />
                    </span>
                    <span className="flex-1">
                      <Field
                        value={s.url}
                        onChange={(v) => updateItem('socials', s.id, { url: v })}
                        placeholder="https://"
                        maxLength={400}
                      />
                    </span>
                    <RemoveButton onClick={() => removeItem('socials', s.id)} />
                  </div>
                ) : (
                  <a href={safeUrl(s.url)} target="_blank" rel="noreferrer" className="pf-social">
                    <span>{s.label}</span>
                    <ArrowUpRight className="size-3.5" />
                  </a>
                )}
              </Reveal>
            ))}
            {editing && (
              <AddButton
                className="pf-add-inline"
                onClick={() => set('socials', [...data.socials, emptySocial()])}
              >
                Add link
              </AddButton>
            )}
          </div>
        </Section>
      )}

      <footer className="pf-footer">
        <span>
          © {new Date().getFullYear()} {data.name || 'Your name'}
        </span>
        <ScrollLink to="top" className="pf-nav-link">
          Back to top
        </ScrollLink>
      </footer>
    </div>
  )
}

/** Scrolls to a section without writing a #hash into the address bar. */
function ScrollLink({
  to,
  children,
  ...rest
}: { to: string; children: ReactNode; className?: string; 'aria-label'?: string }) {
  const { pathname } = useLocation()
  const go = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    if (to === 'top') window.scrollTo({ top: 0, behavior: 'smooth' })
    else document.getElementById(to)?.scrollIntoView({ behavior: 'smooth' })
  }
  return (
    <a href={to === 'top' ? pathname : `#${to}`} onClick={go} {...rest}>
      {children}
    </a>
  )
}

function Section({
  id,
  number,
  title,
  children,
  editing,
  onTitle,
  onRemove,
  titlePlaceholder = 'Section title',
}: {
  id: string
  number: string
  title: string
  children: ReactNode
  editing?: boolean
  onTitle?: (value: string) => void
  onRemove?: () => void
  titlePlaceholder?: string
}) {
  return (
    <section id={id} className="pf-section">
      <Reveal className="pf-section-head">
        <span className="pf-section-num">{number}</span>
        {editing && onTitle ? (
          <span className="pf-section-title is-editable">
            <Field value={title} onChange={onTitle} placeholder={titlePlaceholder} maxLength={60} />
          </span>
        ) : (
          <span className="pf-section-title">{title}</span>
        )}
        <span className="pf-section-rule" />
        {editing && onRemove && <RemoveButton onClick={onRemove} />}
      </Reveal>
      {children}
    </section>
  )
}

function SkillEditor({
  skills,
  onChange,
}: {
  skills: string[]
  onChange: (skills: string[]) => void
}) {
  const [draft, setDraft] = useState('')
  const add = () => {
    const parts = draft
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    if (parts.length) onChange([...skills, ...parts].slice(0, 40))
    setDraft('')
  }
  return (
    <div className="pf-skill-editor">
      <span className="pf-label">Skills</span>
      <div className="flex flex-wrap items-center gap-2">
        {skills.map((s, i) => (
          <span key={`${s}-${i}`} className="pf-chip">
            {s}
            <button
              type="button"
              aria-label={`Remove ${s}`}
              onClick={() => onChange(skills.filter((_, j) => j !== i))}
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          maxLength={80}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault()
              add()
            } else if (e.key === 'Backspace' && !draft && skills.length) {
              onChange(skills.slice(0, -1))
            }
          }}
          onBlur={add}
          placeholder={skills.length ? 'Add another…' : 'Type a skill, press Enter'}
          className="pf-chip-input"
        />
      </div>
      <p className="pf-hint">These drift by in a slow ticker on your live page.</p>
    </div>
  )
}

function AddButton({
  children,
  onClick,
  className,
}: {
  children: ReactNode
  onClick: () => void
  className?: string
}) {
  return (
    <button type="button" onClick={onClick} className={cn('pf-add', className)}>
      <span className="pf-add-icon">
        <Plus className="size-4" />
      </span>
      {children}
    </button>
  )
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="pf-remove" aria-label="Remove">
      <X className="size-4" />
    </button>
  )
}
