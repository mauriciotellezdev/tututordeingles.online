# Copilot instructions for tututordeingles.online

## Build / Run / Lint (how to run)
- Dev server: npm run dev
- Production build: npm run build
- Start production server: npm run start
- Lint: npm run lint
- Lint a single file: npm run lint -- src/app/page.tsx
- Notes: There is no test script or test framework in the repo (no Jest/Vitest files detected).

## High-level architecture (big picture)
- Next.js (app router, Next 16) TypeScript project. App entry and routes live in src/app/ (layout.tsx, page.tsx, etc.).
- UI primitives and shared components live under src/shared/ui — this repository uses a shadcn-style component library pattern.
- Small helper utilities (className merging, etc.) live in src/lib (e.g., cn in utils.ts).
- Global styling is in src/app/globals.css and uses Tailwind CSS, tw-animate-css, and shadcn/tailwind.css.
- Build tools and formatting: ESLint (eslint.config.mjs), Prettier with prettier-plugin-tailwindcss (.prettierrc), PostCSS plugin @tailwindcss/postcss (postcss.config.mjs).
- next.config.ts sets reactCompiler: true. TypeScript is strict; path alias @/* → src/* (see tsconfig.json).

## Key conventions and patterns
- Classnames: use the cn(...) utility (src/lib/utils.ts) which composes clsx + tailwind-merge for safe Tailwind merging.
- Component organization: small presentational components in src/shared/ui, pages and layout in src/app. Follow the existing file-per-component pattern.
- Styling: prefer Tailwind utility classes and the theme CSS variables defined in globals.css. Dark theme is toggled via a top-level .dark class.
- Fonts: next/font/google used in layout.tsx (Plus Jakarta Sans) — keep font config centralized in layout.
- ESLint & Prettier: repo depends on Next's ESLint configs and Prettier plugin for Tailwind — run `npm run lint` before commits.
- Path alias: use import "@/..." to reference files under src/ (tsconfig.json).

## Docs / AI assistant integrations discovered
- README.md contains the basic Getting Started snippet (npm run dev) and Vercel deployment note.
- No CONTRIBUTING.md, CLAUDE.md, AGENTS.md, CONVENTIONS.md, .cursorrules, .windsurfrules, .clinerules, or other assistant-specific rule files were found.

## Quick troubleshooting notes for Copilot sessions
- If code completion suggests classnames concatenated without using cn(...), prefer replacing with cn(...) so Tailwind merge works correctly.
- When modifying global theme tokens, update src/app/globals.css variables and check both light and .dark sections.
- When adding new packages that affect CSS (Tailwind plugins, shadcn), update postcss.config.mjs and rebuild.

## PRD (short summary)
- Spanish landing, responsive, pricing (single + bundle), signup, placement test, booking (≥24h, hourly slots), passwordless login, Stripe payments, .ics emails, student & teacher dashboards.
- Full PRD: ./PRD.md  (last synced: 2026-05-23T11:59:05.611-06:00)

----

(End of copilot instructions)
