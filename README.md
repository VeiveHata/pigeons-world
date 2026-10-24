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
| `npm run tiles` | Re-cut the tracker picture into tiles (see below) |
| `npm run plants` | Redraw the placeholder plant images (see below) |

## Project structure

```
├── assets-src/             Source images that are never served (the full tracker picture)
├── scripts/                Build helpers (slice-image.mjs, draw-plants.mjs)
├── index.html              Entry page: default title, description, manifest
├── public/                 Static files served as-is (favicon, manifest)
└── src/
    ├── main.ts             Creates the Vue app and installs the router
    ├── router.ts           Routes, with each page's title and description
    ├── App.vue             Layout: header, current page, footer
    ├── global.css          Tailwind directives and base styles
    ├── components/         AppHeader, HeaderLink, AppFooter
    ├── pages/              One component per route
    ├── tracker/            Learning tracker state, timer, levels, settings and grid config
    ├── plants/             Plant list, growth stages and image paths
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

## Learning tracker (`/pigeons`)

The Pigeons page is a study timer that rewards each session with a piece of a picture and grows a plant for every topic:

1. Add a topic on the left and choose a plant for it: Echeveria, Aloe, Jade plant or Cactus. Each topic has its own timer, picture and plant. To rename a topic, click ✎ or double-click its name; Enter or clicking away saves, Escape cancels.
2. Start the timer. A chime plays when it ends, and the topic earns one square.
3. Click any dark square and rub it with the mouse or a finger. Once most of it is scratched off, that piece of the pigeon stays revealed.
4. **One full picture (40 squares) is one level.** Finishing it levels the topic up, the plant grows, and you start a fresh picture.

Only one timer runs at a time; starting another topic's timer pauses the current one. Topics, timers, levels and settings are saved in the browser's `localStorage`. A session that ends while the page is closed still counts the next time the page opens. Saves from before plants and levels existed are upgraded automatically.

### Settings

**Session length** (1–180 minutes, default 45) is set at the bottom of the topic list. Timers that haven't been started switch to the new length right away; a running or paused timer finishes with the length it started with.

### Plants and the room (`/succulents`)

The Succulents page is a room with every topic's plant on shelves, showing its level, growth stage and progress to the next level. Clicking a plant opens that topic on the Pigeons page.

Each plant has 5 growth stages, one per level: Seed → Sprout → Young → Mature → Flowering. From level 5 on, the plant stays flowering while the level number keeps rising.

The plant pictures are placeholders drawn by `npm run plants` (`scripts/draw-plants.mjs`) into `public/plants/<plant>/<stage>.svg`, for example `public/plants/aloe/3.svg`. To use real illustrations, replace those 20 files, keeping the names. Each image should be 120 × 160 (or the same 3 : 4 ratio) with the pot at the bottom and the same pot size at every stage, so plants line up on the shelf. To use PNG or WebP instead of SVG, change the extension in `plantImage` in `src/plants/plants.ts`. The plant list itself is in the same file.

### How the picture loads

The full photo (`assets-src/pigeon.jpg`) is never sent to the browser. `npm run tiles` cuts it into 8 × 5 square tiles in `public/tiles/pigeon/0.webp` … `39.webp`, numbered row by row. The page only requests a tile once its square is picked for scratching or has already been revealed. To change the picture or the grid size, replace the source image or edit `src/tracker/grid.json`, then run `npm run tiles` again.

### Testing faster

In development, add `?minutes=0.1` to the URL (for example `http://localhost:5173/pigeons?minutes=0.1`) to make a session last 6 seconds. It overrides the session length setting and is ignored in production builds.

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
