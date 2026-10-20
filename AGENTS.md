# AGENTS.md

## Project overview

**fleed** (formerly "blank.") is a minimal, zen-styled portfolio builder. The home route (`/`) renders the portfolio layout with every piece of text as an editable field. Users publish to a public, read-only page at `/p/$id`.

Stack: TanStack Start, React 19, Tailwind CSS 4, shadcn/ui primitives (`src/components/ui`), Netlify Blobs, deployed via `@netlify/vite-plugin-tanstack-start`.

## Key files

```
src/
├── lib/portfolio.ts                 # Portfolio type, blank defaults, accents, normalizePortfolio() (length limits), safeUrl()
├── server/
│   ├── portfolio.server.ts          # Server-only: Netlify Blobs store "portfolios", token hashing
│   └── portfolio.functions.ts       # createServerFn wrappers: publishPortfolio (POST), getPortfolio (GET)
├── components/portfolio/
│   ├── Portfolio.tsx                # The whole layout; `editing` toggles Field inputs vs. rendered text
│   ├── Field.tsx                    # Auto-growing transparent textarea that inherits typography
│   └── effects.tsx                  # Reveal, SplitText, Marquee, Enso, Wordmark, Backdrop, ScrollProgress, LiveClock
├── routes/
│   ├── __root.tsx                   # HTML shell, Google Fonts (Instrument Serif, Instrument Sans, JetBrains Mono), forced dark class
│   ├── index.tsx                    # Editor: localStorage draft, dock (mode toggle, accents, completeness, publish), share dialog, intro
│   └── p.$id.tsx                    # Public page: loader fetches from Blobs, notFound fallback
└── styles.css                       # Theme vars + all fleed animation/layout CSS (classes prefixed pf-, dock-, etc.)
```

## Conventions & decisions

- **One layout, two modes.** Don't fork the layout for editor vs. public page. Add new sections to `Portfolio.tsx` with an `editing ? <Field/> : text` branch, and hide them in view mode when empty.
- **New fields** go in the `Portfolio` type, `blankPortfolio()`, and `normalizePortfolio()`. The server only stores normalized data.
- **Links** shown to visitors must go through `safeUrl()`, which allows only http/https/mailto.
- **Ownership** has no accounts. Publishing returns `{id, token}`. Only a SHA-256 hash of the token is stored in the blob, and the browser keeps the raw token in localStorage (`blank:published`). A token mismatch creates a new page instead of overwriting.
- **Draft** state lives in localStorage (`blank:draft`). Only published pages are persisted server-side.
- **Aesthetic** is calm and minimal (zen): warm dark palette, muted accents, hairlines, generous whitespace, slow easing. Avoid loud effects (custom cursors, tilt, glows, confetti).
- **localStorage keys** keep the legacy `blank:` prefix on purpose so existing drafts and edit tokens survive the rename.
- **Animations** are plain CSS, plus small rAF/IntersectionObserver hooks in `effects.tsx`. No animation library. `prefers-reduced-motion` disables them.
- The accent colour is the CSS variable `--accent-c`, set inline on `.app` / `.portfolio`.
- Keep server-only imports (`@netlify/blobs`, `node:crypto`) in `*.server.ts` files.
