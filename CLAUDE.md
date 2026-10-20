# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal portfolio site built on the Laravel + React (Inertia) starter kit: Laravel 12 backend, React 19 + TypeScript frontend via Inertia.js v2, Tailwind CSS v4, shadcn/ui components. Public-facing site (projects, blog, activities, tools) plus an authenticated admin area for managing content.

## Commands

### Dev server
- `composer dev` — runs PHP server, queue listener, and Vite dev server concurrently (the normal way to develop).
- `composer dev:ssr` — builds SSR bundle then runs server + queue + Inertia SSR server.
- `npm run dev` — Vite only (if the PHP server is already running separately).

### Build
- `npm run build` — production frontend build.
- `npm run build:ssr` — client + SSR build.

### Lint / format / types
- `npm run lint` — ESLint with `--fix`.
- `npm run format` / `npm run format:check` — Prettier over `resources/`.
- `npm run types` — `tsc --noEmit`.
- `vendor/bin/pint` — PHP formatting (Laravel Pint).

### Tests
- `composer test` or `php artisan test` — runs the full Pest suite (clears config cache first).
- Single test: `php artisan test --filter=<TestName>` or `php artisan test tests/Feature/Path/ToTest.php`.
- Tests use Pest (`pestphp/pest`) with `tests/Feature` and `tests/Unit`; DB is in-memory SQLite during tests (see `phpunit.xml`).

### Other
- `php artisan migrate` — run migrations (MySQL by default; see `.env`).
- `php artisan tinker` — REPL.

## Architecture

### Backend structure
Controllers are split by audience:
- `app/Http/Controllers/Public/*` — public pages (About, Activity, Blog, Favorite, Project, Tools). Route-model-bound where relevant (e.g. `{project:slug}`).
- `app/Http/Controllers/Admin/*` — authenticated CRUD for content (Projects, Activities, Posts, TechStacks, Favorites, Journeys, ShortLinks) plus an `UploadController` for image handling. All admin routes live under `auth`+`verified` middleware and the `admin.` route-name/`/admin` prefix in `routes/web.php`.
- Top-level controllers (`HomeController`, `DashboardController`, `ContactController`, `SearchController`, `OpenGraphController`, `ShortLinkRedirectController`) handle cross-cutting concerns.
- `ShortLinkRedirectController` is registered last in `routes/web.php` as a catch-all single-segment route (`/{code}`) — new top-level routes must be added *above* it or they'll be shadowed.
- `app/Http/Middleware/HandleInertiaRequests.php` shares global Inertia props (auth, appearance, SEO, etc.); `ShareSeoData` and `HandleAppearance` handle SEO meta and light/dark appearance state respectively.
- OpenGraph images are generated dynamically under `/og/*` (blog, project, and a throttled generic `/og/generate`).

### Frontend structure (Inertia + React)
- `resources/js/pages/` mirrors the controller split: `Public/*` and `Admin/*` subfolders, each page component corresponding to a controller action/Inertia response.
- `resources/js/layouts/` — `app-layout.tsx` (authenticated/admin shell), `guest-layout.tsx` (public site), `auth-layout.tsx`, plus `settings/` layout variants.
- `resources/js/components/ui/` — shadcn/ui primitives (managed via `components.json`; shadcn registries `@aceternity` and `@magicui` are configured alongside the default shadcn registry).
- `resources/js/components/aceternity/` and `resources/js/components/portfolio/` — animated/decorative components specific to the portfolio's public presentation (hover cards, dot grid backgrounds, scroll effects, terminal cards, etc.).
- `resources/js/lib/` — non-UI helpers: `pdf-utils.ts`, `image-compression.ts` (used by the `/tools` PDF/image utilities, which run client-side), `project-utils.ts`, `tech-icons.ts`.
- Path alias `@/*` maps into `resources/js/*` (see `tsconfig.json` / `components.json` aliases: `@/components`, `@/lib`, `@/hooks`, `@/components/ui`).
- SSR entry is `resources/js/ssr.tsx`, client entry `resources/js/app.tsx`; `laravel-vite-plugin` wires both into the Laravel build.

### Content model
Core domain models (`app/Models/`): `Project`, `Post` (blog), `Activity`, `Journey`, `TechStack`, `Tag`, `Favorite`, `Contact`, `ShortLink`/`ShortLinkClick`. Most content types share the `is_active` flag pattern and slug-based public routing. `TechStack` has a `show_in_orbit` flag feeding the `tech-stack-orbit.tsx` visualization. Short links are tracked with click analytics via `ShortLinkClick`.

### Tools section
`/tools/*` routes (image-compress, jpg-to-pdf, pdf-merge, pdf-split, pdf-to-images, pdf-compress, pdf-rotate) are client-side utilities using `pdf-lib`, `pdfjs-dist`, `jszip`, and `heic2any` — processing happens in the browser, not on the server.

## Conventions

- Prettier config enforces `printWidth: 150`, `tabWidth: 4`, single quotes, and auto-sorted imports (`prettier-plugin-organize-imports`) plus sorted Tailwind classes (`prettier-plugin-tailwindcss`, aware of `clsx`/`cn`).
- ESLint flat config (`eslint.config.js`) extends recommended JS/TS/React rules with `react-hooks/rules-of-hooks` as an error; `react/react-in-jsx-scope` and `react/prop-types` are off (React 19 JSX transform).
