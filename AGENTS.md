# Repository Guidelines

## Project Structure & Module Organization
- Root HTML: `index.html`, language pages in `zh/`, `tr/`, `ko/`, `ja/`, `es/`, `fr/`, `de/`, `pt/`, `mi/`, `gn/`.
- Scripts: `js/` (app, i18n, image optimizer, SW helpers), `sw.js`, `sw-optimized.js`.
- Styles: `css/` (Tailwind build output `main.css`), config in `tailwind.config.js` and `postcss.config.js`.
- Utility & ops: `scripts/` (quality, deployment), `_redirects`, `nginx.conf`, `tools/sw-reset.html` (clear SW/cache).
- Tests: `tests/functional-tests.js` (lightweight/manual-driven).

## Build, Test, and Development Commands
- `npm run build:all` — build inline translations + CSS.
- `npm run serve:node:8790` / `:8888` — local static server on port 8790/8888.
- `npm run serve:python:8790` — Python http.server alternative.
- `npm run dev:clean:unix` / `dev:clean:win` — start server and open `tools/sw-reset.html` to clear SW/cache.
- `npm run test:quality` — run repository quality checks.

## Coding Style & Naming Conventions
- JavaScript/HTML/CSS; indent 2 spaces; keep lines ≲100 chars.
- Naming: `lowerCamelCase` (vars/functions), `UpperCamelCase` (classes), `UPPER_SNAKE_CASE` (consts), files in `kebab-case`.
- Prefer ES modules and named exports; order imports: built‑ins → third‑party → local.
- Tailwind utility‑first; avoid custom CSS unless in `@layer`.
- No secrets in client code; remove `console.log` in production paths.

## Testing Guidelines
- Primary: manual/browser checks. Suggested: offline support (Application → Service Workers), basic flows, i18n swap.
- Scripted: `npm run test:quality` for static checks.
- Keep tests near `tests/` and name by feature (e.g., `feature-name.spec.js`).

## Commit & Pull Request Guidelines
- Use Conventional Commits: `feat|fix|docs|refactor|test|chore(scope): summary`.
- PRs include: what/why, risk/impact, verification steps, and screenshots when UI changes.
- Keep changes small and focused; link related issues.

## Security & Configuration Tips
- Service Worker must cache same‑origin only; validate message payloads; don’t cache third‑party scripts.
- IndexNow runs server‑side only (no client secrets). Debug PHP tools return 403 by default.
- CSP is enabled (report‑only by default); adjust with a rollout plan and tests.
