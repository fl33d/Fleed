# fleed

A portfolio that starts completely empty. Every line on the page is a text box styled like the finished design. Click and type your name, role, story, projects, experience and contact links straight into the layout, then publish it to a shareable link.

The look is quiet and minimal, with a zen feel: warm sumi-ink tones, lots of space, and one faint ensō circle that slowly breathes behind the page. The motion is gentle. An ensō draws itself around the wordmark when the page opens, sections fade in as you scroll, the name drifts in letter by letter, skills pass by in a slow ticker, and a calm dock holds the Edit/Preview toggle, accent swatches and a completion ring.

## Features

- **Edit in place**: the editor at `/` is the portfolio itself. Empty fields show soft, breathing placeholders.
- **Preview**: switch to see the page exactly as visitors will. Empty sections are hidden.
- **Accent colours**: six muted presets (sage, clay, mist, sand, blossom, stone) recolour the whole page.
- **Autosave**: drafts are saved to the browser as you type.
- **Publish & update**: one click stores the portfolio in Netlify Blobs and gives you a `/p/<id>` link. Your browser keeps a private edit token, so **Update** pushes changes to the same link.

## Tech

TanStack Start (React 19), Tailwind CSS 4 plus custom CSS animations, Netlify Blobs for published pages, deployed on Netlify.

## Running locally

```bash
pnpm install
netlify dev
```

Use `netlify dev` rather than plain `vite dev` so Netlify Blobs is emulated locally.
