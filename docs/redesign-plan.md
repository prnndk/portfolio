# Redesign "Signal" — implementation plan

Branch: `feat/redesign-signal`. Design reference: the "Portfolio Redesign" canvas (Home + Mascot boards).

## Goals

- A tidier, more distinctive public site: one container width, one section-header pattern, a strict spacing scale, fewer competing effects.
- One interactive 3D moment (hero) built with three.js via `@react-three/fiber`, lazy-loaded and client-only so SSR and first paint stay fast.
- A personal mascot ("Gading", drawn from `public/profile.jpg`) reused across the site: hero, contact CTA, loading, 404 and empty states, footer mark.
- No change to backend, routes, data or the tools' file-processing logic.

## Design rules

| Token | Value |
|---|---|
| Ground (dark / light) | `#0D0D0F` / `#FAFAF9` |
| Surface | `#16161A` / `#FFFFFF` |
| Primary (signal orange) | `oklch(0.68 0.2 40)` |
| Accent 2 (lilac) | `oklch(0.82 0.09 290)` |
| Display font | Bricolage Grotesque 600–800, tight tracking |
| Body / mono | Inter / JetBrains Mono |
| Container | `max-w-6xl px-4 sm:px-6` everywhere |
| Section rhythm | `py-24 md:py-32`, header = mono index (`01 / Work`) + display title + optional action link |
| Radius | cards `rounded-3xl`, chips `rounded-full` |

Removed for tidiness: tilted marquee, staggered hero name, dot-grid + spotlight stacking, floating badges, orbit + grid duplication.

## Phases

1. **Foundation** — `resources/css/app.css` tokens (light + dark), fonts in `resources/views/app.blade.php`, shared utilities (`section-index`, marquee keyframes, reduced-motion guard).
2. **Mascot** — `components/portfolio/mascot.tsx`: SVG poses `idle | wave | coding | lost`, eyes follow the pointer, blink, respects `prefers-reduced-motion`. `MascotMark` head for logo/footer.
3. **3D hero** — `components/portfolio/hero-scene.tsx`: three.js scene with a low-poly mascot head that turns toward the pointer, plus floating tech tokens with drag-to-spin. Loaded with `React.lazy` after mount; SVG mascot is the SSR/no-WebGL fallback.
4. **Layout** — `layouts/guest-layout.tsx`: cleaner floating nav (same links, search, theme toggle, tools menu), new footer with mark, socials and sitemap.
5. **Shared pieces** — `PageHeader` restyle (affects every public page), `SectionHeader`, `Marquee`, `MagneticButton`, `TiltCard` (CSS 3D tilt).
6. **Homepage** — rewrite `pages/welcome.tsx` on the new pieces: hero (3D), marquee, work bento, stack spec sheet, journey, writing, tools + favorites, contact CTA with waving mascot.
7. **Error / empty states** — `pages/error.tsx` uses the `lost` mascot.
8. **Verify** — `npm run types`, `npm run lint`, `npm run build`, then a manual check in the browser (desktop + phone width, light + dark).

## Later (not in this branch)

- Restyle inner list/detail pages beyond the shared header and tokens.
- Page transitions via the View Transitions API.
- A modelled 3D mascot (GLB) replacing the primitive-built head.
