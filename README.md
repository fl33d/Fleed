# Fleed

A minimal, editable portfolio builder with a calm, ink-inspired design.

**[Live site](https://fleed.online/)**

Fleed lets you build a personal portfolio directly on the page. Edit your name, role, story, projects, experience, skills, and contact links in place, preview the result, then publish it to a shareable URL.

## Features

- **Edit in place** — build your portfolio by editing text directly in the layout.
- **Live preview** — switch between editing and visitor view; empty sections stay hidden.
- **Colour themes** — choose from six muted accents: sage, clay, mist, sand, blossom, and stone.
- **Autosaved drafts** — changes are saved in your browser as you work.
- **Publish and update** — publish a portfolio to a shareable `/p/<id>` URL and update that same page later.
- **Subtle motion** — restrained animations, a breathing ensō, scroll reveals, and a skills ticker.

## Tech stack

- React 19
- TanStack Start
- TypeScript
- Tailwind CSS 4
- Netlify Blobs
- Netlify

## Run locally

### Requirements

Install Node.js, pnpm, and the Netlify CLI.

```bash
pnpm install
netlify dev
```

Run the app with `netlify dev` rather than plain `vite dev` so the Netlify development environment can emulate Netlify Blobs.

## Project structure

- `src/components/portfolio/` — portfolio layout and editing components
- `src/components/ui/` — reusable interface components
- `src/routes/` — application routes and API endpoints
- `src/lib/` — shared utilities and portfolio types

## Status

Fleed is an actively developed personal project. Feedback and suggestions are welcome.
