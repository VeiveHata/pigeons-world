# Pigeons World

**Trying 2B Happy**: a small site about pigeons and succulents, built with [Vue 3](https://vuejs.org/), [Vue Router](https://router.vuejs.org/), [Vite](https://vitejs.dev/) and [Tailwind CSS](https://tailwindcss.com/).

## Getting started

Requires Node.js 18 or newer.

```shell
npm install
npm start        # dev server at http://localhost:5173, opens the browser
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm start` | Same, and open the browser |
| `npm run build` | Type-check with `vue-tsc`, then build to `dist/` |
| `npm run preview` | Serve the production build from `dist/` locally |
| `npm run build.types` | Type-check only |
| `npm run lint` | Run ESLint on `src/` |
| `npm run fmt` / `npm run fmt.check` | Format with Prettier / check formatting |

## Project structure

```
├── index.html              Entry page: default title, description, manifest
├── public/                 Static files served as-is (favicon, manifest)
└── src/
    ├── main.ts             Creates the Vue app and installs the router
    ├── router.ts           Routes, with each page's title and description
    ├── App.vue             Layout: header, current page, footer
    ├── global.css          Tailwind directives and base styles
    ├── components/         AppHeader, HeaderLink, AppFooter
    ├── pages/              One component per route
    ├── constants/          Shared constants (company name)
    └── media/              Images imported by components (logo)
```

## Pages

| Path | Component | Title |
|---|---|---|
| `/` | `pages/HomePage.vue` | Trying 2B Happy |
| `/pigeons` | `pages/PigeonsPage.vue` | Pigeons World |
| `/succulents` | `pages/SucculentsPage.vue` | Succulents World |

### Adding a page

1. Create a component in `src/pages/`, for example `FernsPage.vue`.
2. Add a route for it in `src/router.ts`, with a `meta.title` and `meta.description`. These are applied to the document after each navigation.
3. Optionally, add a `<HeaderLink to="/ferns">` to `src/components/AppHeader.vue`.

## Styling

Tailwind's color palette is replaced with the site's own colors in `tailwind.config.js`:

| Class suffix | Color | Used for |
|---|---|---|
| `navy` | `#202734` | Main color: header, footer, home page text |
| `green-light` | `#B7D894` | Accent; text on the succulents page |
| `green-pale` | `#E0F8C7` | Home page background, footer text |
| `slate` | `#36415A` | Pigeons only: page background |
| `lilac` | `#C9B8E8` | Pigeons only: accent and text |
| `green-dark` | `#2F4B26` | Succulents only: page background |

Use them as `bg-navy`, `text-lilac` and so on. Tailwind's default colors, such as `red-500`, are not available.

### Fonts

The site uses typewriter-style fonts, bundled through [Fontsource](https://fontsource.org/) so they work offline:

- **Courier Prime** (`font-typewriter`): body text, links and the footer. It's the default font for the whole page.
- **Special Elite** (`font-display`): headings (`h1`–`h3`). It has a worn, inked look.

> After changing `tailwind.config.js`, restart the dev server. A server that is already running may keep using the old config, so new classes won't show up.

## Deployment

`npm run build` produces a static single-page app in `dist/` that any static host can serve. The router uses HTML5 history mode, so the host must send `index.html` for any path that isn't a real file. Otherwise, opening `/pigeons` directly returns a 404. See the [Vue Router guide](https://router.vuejs.org/guide/essentials/history-mode.html#Example-Server-Configurations) for example server configurations.
