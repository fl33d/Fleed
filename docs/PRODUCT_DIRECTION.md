# Fleed — product direction

## The idea

**Fleed is a portfolio you write directly where it will be viewed.** No cluttered dashboard, no huge stack of templates, no forced sign-up before someone can begin. The portfolio itself is the editor. Draft it, refine it, preview it, publish it and share one clean link.

Fleed should feel polished and calming, not generic or over-designed. Its engineering should be substantially more rigorous than its simple interface suggests.

## Who it is for

- Students and junior developers who need a credible place to show projects, experience and skills.
- Designers and creative builders who want an intentional page without learning website hosting.
- People who want to publish once, then return to improve content instead of rebuilding from scratch.

## Product principles

1. **One page, two modes.** Editing and viewing use the same core presentation, so previews are trustworthy.
2. **The content is the product.** Typography, colour and motion support the work rather than distract from it.
3. **Publish without unnecessary friction.** Keep initial setup simple while making edit permissions understandable.
4. **Ownership and portability.** Drafts save locally; JSON backup/import does not expose private edit credentials.
5. **Performance and accessibility are features.** Keyboard access, reduced motion and mobile responsiveness matter as much as animations.
6. **Claims must be verifiable.** Do not claim R2, GPT, Claude, Cloudflare custom-domain hosting or observability is operational until tested.

## Typical five-minute journey

1. Open Fleed and see a calm, legible example of a page being edited directly.
2. Click a name, role or project and replace placeholder content.
3. Adjust palette, font, layout and visible sections in the existing small customisation panel.
4. Preview what a visitor sees, using the same layout code.
5. Publish, receive a link, and save a JSON draft backup. Later, revisit this browser and update the same portfolio if the edit token is still present.

## What is deliberately NOT the goal

- Not a social network, engagement feed, job board or influencer platform.
- Not an unbounded AI résumé generator that fabricates experience.
- Not a large enterprise CMS with a complex administration UI.
- Not a showcase of vendors whose names appear in screenshots but whose APIs are unused.

## Technical identity

| Layer | Current/pending implementation |
| --- | --- |
| Client | React 19, TypeScript, Tailwind CSS 4, responsive in-place editing |
| Framework | TanStack Start / Router, server functions, raw server routes |
| Persistence | Cloudflare D1, JSON portfolio records and hashed edit credentials |
| Runtime | Cloudflare Workers; direct Workers.dev hostname verified |
| Media | **Planned:** authorised Cloudflare R2 uploads with strict quotas and validation |
| Delivery | GitHub Actions CI, Cloudflare Workers Builds for production |
| Developer integration | TypeScript MCP protocol server with read-only operations (review branch) |
| Safety | Public-link protocol validation, portfolio normalisation, reduced-motion support; further abuse protection planned |

## Priority order

### P0 — trustworthy launch

- Merge only a passing, reviewed PR. Preserve D1 data and prevent silent overwrite/duplicate updates.
- Complete `fleed.online` custom-domain cutover with Cloudflare and registrar access; test old Netlify redirects and keep a rollback plan.
- Verify an actual create/read/update cycle on the *deployed Worker*, not just a local or mocked environment.
- Check the mobile browser experience, keyboard controls and safe error messages.

### P1 — full personal portfolio functionality

- Implement R2-backed image upload after confirming account/bucket, access limits and cost protection.
- Make project images and profile photo selection simple, responsive and accessible.
- Add local D1 integration tests for create/update, bad credentials, missing IDs and bad input.
- Provide clear saved/unsaved state and improved recovery of editing access.

### P2 — differentiation

- Optional GitHub project import: choose repositories you own, then edit descriptions manually; never fabricate contributions or project impact.
- Portfolio export with better portability; potentially version history and simple undo.
- Strong design presets rather than dozens of overlapping options.

### P3 — useful, optional AI

- An opt-in *writing reviewer* could suggest clearer descriptions or highlight missing context. It must not invent jobs, experience, achievements, skills or metrics.
- Evaluate Cloudflare Workers AI or a hosted provider only after explicit user consent, budget/quotas, privacy disclosures and provider account eligibility.
- A developer MCP server can be integrated into AI coding tools separately; that is not equivalent to embedding AI into the public website.

## Definition of quality

- A visitor can understand what Fleed does within seconds.
- No user must hunt through an enormous settings panel just to publish.
- Existing portfolios cannot be overwritten without valid edit credentials.
- Published pages remain readable and functional on mobile and with reduced motion.
- No deployment is described as successful until the actual Worker and custom domain have been verified.
- An engineer looking at the repo sees checks, real incident diagnosis, clear trade-offs and accurate documentation.

## Guiding phrase

**Quiet interface. Serious engineering.**
