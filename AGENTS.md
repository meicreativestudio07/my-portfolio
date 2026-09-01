# Mei Portfolio Engineering Guide

This file is the source of truth for every implementation session in this repository.

## Product direction

- Build a restrained, editorial photography portfolio inspired by Ittetsu Matsuoka's portfolio.
- Let artwork provide the color. Interface chrome stays white, near-black, and muted gray.
- Preserve generous negative space. Do not add cards, shadows, borders, gradients, badges, or decorative UI unless the product direction changes explicitly.
- Desktop is a quiet four-column gallery. Mobile is an immersive single-column reading experience.
- The root route is a full-bleed portrait introduction with an original white botanical line drawing and ephemeral centered name; it yields to `/portfolio` automatically or on click through a white veil.
- Routes: `/portfolio` (personal work gallery) with `/work/[slug]` details, `/corporate` and `/wedding` (commission indexes, one band of three cuts per project) with `/corporate/[slug]` and `/wedding/[slug]` details, and `/statement`.
- Motion must be subtle: opacity, color, and small scale/translate changes only.

## Design tokens

- `src/app/globals.css` is the only source of truth for visual primitives.
- Use an existing CSS custom property for every color, spacing, type size, radius, duration, easing, and layout measurement.
- Never introduce arbitrary values in component CSS or Tailwind arbitrary-value syntax.
- If a required value is missing, add a semantic token to `:root` first and document why it belongs in the system.
- Do not restore automatic dark mode. The portfolio is intentionally art-directed on a white canvas.

## Architecture

Follow a pragmatic Bulletproof React structure:

```text
content/               # works and commissions: photos + YAML, one folder per work
scripts/               # generate-content.mjs and repo checks
src/
  app/                 # Next.js routing, layouts, metadata, global styles
  components/          # shared cross-feature UI and layout
  features/<feature>/  # feature api, components, data (generated), and types
  lib/                 # framework-agnostic shared utilities
```

- Feature code stays inside its feature directory.
- Do not create barrel `index.ts` files. Import from the defining module directly.
- Route files compose features and own metadata; they do not contain feature implementation details.
- Keep content access behind `features/<feature>/api` so a storage change never touches UI components.
- Treat fetched data as immutable with readonly types.

## Content management

- Content is managed in this repository; there is no CMS. Works and commissions live under `content/` — one folder per work with its images and an `index.yaml`, ordered by each section's `order.yaml` (`items:` array of slugs), with per-section page copy in `section.yaml`.
- The layout follows the Keystatic conventions (entry file named `index.yaml`, thumbnail referenced explicitly as `thumbnail: <file>`, commission `meta` as a `label`/`value` array); keep new fields compatible with them.
- The Keystatic Admin UI edits `content/` at `/keystatic`. Storage switches on env vars (see `src/lib/keystatic-mode.ts` and `docs/keystatic-github-setup.md`): with the four `KEYSTATIC_*` / `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` vars set it runs in GitHub mode (production `/keystatic` enabled, saving commits directly to the default branch — no draft branches); without them, local mode during `pnpm dev` (saving writes files; committing stays manual) and both `/keystatic` and `/api/keystatic` return 404 in production. The GitHub App is created with `scripts/setup-keystatic-github.mjs` (manifest flow; repo detected from the git remote), and `NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO` overrides the hardcoded repo fallback so a project handover needs no code change. The schema lives in `keystatic.config.ts` and only shapes the editing UI — the generator remains the source of truth for validation and typed data, and the Keystatic reader API is never used.
- Keystatic may re-store images it touches under field-derived paths (e.g. `cuts/0/file.jpg`) and write `hover: {}` for an absent hover; the YAML reference is authoritative and the generator resolves and tolerates both. Do not "fix" such diffs by hand.
- The `/keystatic` routes are exempt from the site's route rules: `SiteFrame` passes them through untouched, so they must not render `<PageReady />` and are outside the design-token system.
- `scripts/generate-content.mjs` validates `content/` and generates the typed data modules (`src/features/*/data/*.generated.ts`, gitignored). It runs automatically inside `pnpm dev` / `build` / `check`; run `pnpm generate` after content edits when the dev server is already running, or before invoking `tsc` directly. On validation errors it writes nothing, so a running dev server never sees a half-generated state.
- Validation errors are written in Japanese for the non-engineer site owner. Keep them that way when extending the generator.
- Never edit `*.generated.ts` by hand.
- The statement page copy and site-wide copy (header name, tab titles, meta description, Instagram URL) are deliberately NOT in `content/` — the owner edits them directly in `src/app/statement/page.tsx`, `src/app/layout.tsx`, and `src/components/layout/site-header.tsx`. Do not extract them into content files again.
- Never commit video files or camera originals. Videos live on YouTube/Vimeo and are referenced by URL in the work's YAML (`video:` on a cut); the detail page embeds the player, the index always shows the still. Images are committed as web-sized JPEGs.
- Image limits are enforced mechanically: `scripts/image-limits.mjs` is the single source for the thresholds (long edge 2000px, 500KB warning, 5MB generation error). `pnpm optimize-images` (sharp) normalizes oversized JPEGs idempotently — EXIF orientation is applied before resizing — and rejects non-JPEG images; the generator warns above 500KB and refuses to generate above 5MB.
- Content editing workflow and rules for non-engineers: `docs/content-guide.md` (referenced by `GEMINI.md` for the site owner's AI CLI).

## React and Next.js

- Server Components are the default. Add `"use client"` only at the smallest interactive boundary.
- Use `next/image` and explicit image dimensions or `fill` with a sized parent.
- Use `next/link` for internal navigation.
- Keep data fetching on the server and pass the minimum serializable data to Client Components.
- Start independent async work together and resolve it with `Promise.all`.
- Import directly from modules; avoid barrel files and unnecessarily large client bundles.
- Provide `prefers-reduced-motion` behavior for all non-essential motion.
- Use semantic landmarks, visible focus states, useful alt text, and at least 44px touch targets.

## TypeScript and functions

- TypeScript strict mode must remain enabled.
- Function declarations are forbidden. Use `const name = (...) => ...` everywhere, including React components and helpers.
- Prefer named component constants followed by `export default ComponentName` when Next.js requires a default export.
- Avoid `any`, type assertions, mutable shared state, and derived state in effects.

## Styling

- Prefer semantic class names in `globals.css` for the portfolio system.
- Use mobile-first styles with the single desktop breakpoint tokenized at `48rem`.
- Component states may reference tokens only; examples: `var(--color-text-muted)` and `var(--motion-duration-normal)`.
- Hover-only information must become permanently visible on touch/mobile layouts.
- Do not add a component library without explicit approval.

## Motion

- Use `motion/react` only inside isolated Client Components.
- Prefer one orchestrated entrance and purposeful hover/focus feedback over scattered animation.
- Never animate layout-affecting properties when transform or opacity can express the same behavior.
- Durations and easing curves must come from the motion tokens in `globals.css`.

## Gallery loading and route transitions

- Treat the gallery layout, its generous vertical padding, and transparent card/media backgrounds as separate from loading behavior. Do not alter them while tuning reveal motion unless the request explicitly changes layout.
- The pale gray hover surface belongs to `.work-card__surface` only. It must remain transparent at rest and fade in only for hover/focus; never use it as a persistent media or grid background.
- Do not hide an image behind a mask whose release depends solely on `onLoad`. Cached images can miss that event. Every loading/reveal state needs a `complete` check, an error path, and a bounded fallback that leaves artwork visible.
- Keep loading state and visual reveal state separate. A failed or late animation must never leave `/portfolio` white, non-interactive, or with all artwork clipped.
- When coordinating the selected-work exit, start related exits from the same user action. Do not wait for one animation to complete before beginning a visually coupled exit unless the intended choreography explicitly requires it.
- Preserve the detail-route transition as a separate flow: `/work/[slug]` has no site header, while `/portfolio` and `/statement` retain the shared header during their crossfade. The commission detail routes (`/corporate/[slug]`, `/wedding/[slug]`) deliberately keep the shared header so index and detail read as one continuous page.
- The commission pages animate with CSS only (scroll-driven `view()` timelines, entrance staggers scoped to one band) and contain no Client Components of their own. Keep that property; every entrance must resolve to visible artwork when timelines are unsupported or motion is reduced.
- Every route must render `<PageReady />` (or call `markPageReady()` from a client boundary); `SiteFrame` keeps a page at opacity 0 until it does, and type checking will not catch the omission.
- When adding, removing, or renaming Client Component props/state, update every caller in the same patch. Run the app after the change; type checking alone will not catch a stale Fast Refresh runtime prop error.
- Verify motion with a fresh `/portfolio` load and a real work-card click, not only through hot reload. If the development runtime has reported an exception or stale client state, restart it before judging the result.
- Compare timing at the target viewport using the supplied recordings/screenshots. Small timing adjustments should be incremental (roughly 40ms at a time) and must not change unrelated transitions.

## Repository hygiene

- Never commit local dependency caches, build output, environment files, or editor/OS artifacts. In particular, keep `/.pnpm-store`, `/node_modules`, and `/.next` ignored.
- Before an initial commit or push, inspect the staged file list and confirm the working tree is clean afterward.

## Quality gate

Before handing off changes, run:

```bash
pnpm check
pnpm exec tsc --noEmit
pnpm build
```

`pnpm check` and `pnpm build` regenerate content modules first; if you run `tsc` directly after changing `content/`, run `pnpm generate` beforehand.

No task is complete with lint, type, accessibility, or build errors.
