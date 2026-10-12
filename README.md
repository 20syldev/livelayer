# LiveLayer

An Instagram Live screen simulator for your demos, tests and practice: viewers joining, comments scrolling, hearts floating up, all fullscreen on your phone.

> Independent project, not affiliated with Instagram or Meta. The screen is a simulation built for demos and practice.

## Features

- Instagram-faithful live screen, fullscreen: LIVE badge, viewer pill, comments without bubbles and with badge pills, floating hearts, badge purchase bar, comment field, share sheet with search and selection.
- Realistic end of live: a confirmation before stopping, then an end screen with the duration, the viewer peak and the comment count.
- Config page with a live preview that follows every setting, in four tabs: profile (photo from the gallery or a URL, validated username), audience (Friends / Creator / Viral scenarios, minimum and maximum, a curve with peaks editable in m:ss, variations), chat (language, pace, comment mix, joins and badges) and effects (hearts and their colors, front camera as the background, duration).
- Pre-launch sheet with a reminder (Do Not Disturb, brightness) and an optional 3-2-1 countdown.
- Comments generated in French, English and Spanish, and the whole live interface follows the same language.
- Discreet exit from the live with a triple tap in the top left corner, and the screen kept awake during the live (Wake Lock).
- No data sent anywhere: the configuration stays in `localStorage`, and so does the camera.
- Landing page in English (`/`), French (`/fr/`) and Spanish (`/es/`), light and dark theme (`next-themes`), with an animated live demo and an interactive bento (audience curve, camera, duration, heart colors, languages).

## Stack

Next.js 16 (App Router, static export), React 19, TypeScript strict, Tailwind CSS v4, shadcn/ui (new-york, Radix primitives through `radix-ui`), next-intl, next-themes, lucide-react.

## Scripts

| Script           | Description                                |
| ---------------- | ------------------------------------------ |
| `npm run dev`    | Dev server on `127.0.0.1:8581`             |
| `npm run build`  | Production build (static export in `out/`) |
| `npm run start`  | Serves `out/` on port 8582                 |
| `npm run check`  | `tsc --noEmit` + ESLint + Prettier (check) |
| `npm run format` | Prettier + ESLint (write)                  |

## Structure

```
messages/               Landing texts (fr.json, en.json, es.json)
public/                 Logo, icons, avatars, robots.txt
src/app/(site)/         Root layout and page of the English landing, served on /
src/app/[locale]/       Root layout and page of the other landings, served on /fr and /es
src/app/(app)/          Root layout of the simulator: /app (config) and /app/live
src/app/appearance/     CSS tokens (theme, live screen, demo scene) and keyframes, imported by globals.css
src/components/landing/ Landing sections (header, hero, demo, use cases, steps, bento, FAQ...)
src/components/config/  Config tabs, preview and pre-launch sheet
src/components/live/    Live screen, share sheet, end of live, countdown
src/components/ui/      Generated shadcn/ui components
src/data/               Brand, default config, scenarios, live and share texts
src/hooks/              Camera, comments, hearts, viewers, timer, fullscreen, storage
src/i18n/               next-intl routing and request config
src/lib/                Formats, validation, metadata, fonts, chart helpers
```

## Notes

- Static export without middleware, with `localePrefix: "as-needed"`: English (the default locale) is served on `/`, the other languages under their prefix, and each one has its own root layout. The simulator (`/app`) stays in French and does not go through `next-intl`.
- The locale is read from the `next/root-params` API, so no page calls the deprecated `setRequestLocale`.
- For fullscreen exit to work on iPhone, add LiveLayer to the Home Screen from Safari.
- Deployment to GitHub Pages goes through `.github/workflows/deploy.yml`.

## License

BSD 3-Clause, see [LICENSE](LICENSE).
