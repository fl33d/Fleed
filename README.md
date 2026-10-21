# Fleed

**A calm, considered space to build and share your portfolio.**

Fleed is a personal portfolio builder designed to make presenting your work feel simple. Create your portfolio directly on the page, shape it around your experience, and publish it at a shareable link — without wrestling with a complicated editor.

**Live site:** [fleed.online](https://fleed.online/)

## What you can do

- **Edit as you go** — update your name, role, introduction, projects, experience, skills, and contact links directly in the layout.
- **Preview before publishing** — switch between editing and visitor views to see how your portfolio will look.
- **Make it yours** — choose from six understated colour themes: sage, clay, mist, sand, blossom, and stone.
- **Keep your draft** — edits are saved in your browser as you work.
- **Publish and update** — share your portfolio through a dedicated link and return to update it later.
- **Enjoy the details** — subtle transitions, scroll reveals, and a moving skills ticker bring the page to life without getting in the way.

## Design approach

Fleed aims to keep the focus on the person and their work. Its visual style uses restrained colour, clear typography, generous spacing, and subtle motion to make portfolios feel personal without becoming distracting.

## Built with

- React 19 and TypeScript
- TanStack Start
- Tailwind CSS 4
- Cloudflare Workers
- Cloudflare D1

## Getting started

### Requirements

Install [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/).

### Install dependencies

```bash
pnpm install
```

### Start the development server

```bash
pnpm dev
```

### Build for production

```bash
pnpm build
```

Cloudflare Worker configuration is maintained in `wrangler.jsonc`.

## Project structure

- `src/components/portfolio/` — portfolio layout and editing components
- `src/components/ui/` — reusable interface components
- `src/routes/` — application routes and API endpoints
- `src/lib/` — shared utilities and portfolio types
- `wrangler.jsonc` — Cloudflare Worker and D1 configuration

## Feedback

Fleed is an actively developed personal project. Feedback, ideas, and suggestions are welcome — especially from people using it to create or review a portfolio.
