# Fleed Copilot instructions

Follow the project-wide rules in `AGENTS.md`. This project is a TanStack Start/Vite app deployed to Cloudflare Workers with Wrangler config in `wrangler.jsonc` and D1 binding `fleed_portfolios`.

When debugging a failed build or deployment:
- Read the exact latest logs first and match the failure to the commit SHA.
- Fix the root cause with the smallest evidence-based change; never blindly edit configuration.
- Use current Cloudflare Skills/docs for Workers, Wrangler, Vite, and D1.
- Verify with `pnpm install --frozen-lockfile`, `pnpm typecheck`, and `pnpm build` as appropriate.
- Keep Cloudflare Workers Builds as the production deploy mechanism; do not add another deploy pipeline.
- Do not claim success without checking the actual run/deployment result.

Safety: never reveal or commit secrets. Do not change DNS, custom domains, production secrets, billing, paid services, Worker names, or account permissions without explicit approval. Never run remote D1 migrations or destructive database operations without approval and a verified backup/rollback plan. Remember that pushing to `main` can trigger a production deployment. Prefer free options and preserve existing data.
