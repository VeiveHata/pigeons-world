# Pigeons World

**DoToDo**: a study tracker where pigeons and plants reward your learning, built with [Vue 3](https://vuejs.org/), [Vue Router](https://router.vuejs.org/), [Vite](https://vitejs.dev/) and [Tailwind CSS](https://tailwindcss.com/).

## Getting started

Requires Node.js 18 or newer.

```shell
npm install
npm start        # dev server at http://localhost:5173, opens the browser
```

## Scripts

| Command                             | What it does                                                            |
| ----------------------------------- | ----------------------------------------------------------------------- |
| `npm run dev`                       | Start the Vite dev server                                               |
| `npm start`                         | Same, and open the browser                                              |
| `npm run build`                     | Type-check with `vue-tsc`, then build to `dist/`                        |
| `npm run preview`                   | Serve the production build from `dist/` locally                         |
| `npm run build.types`               | Type-check only                                                         |
| `npm run lint`                      | Run ESLint on `src/`                                                    |
| `npm run fmt` / `npm run fmt.check` | Format with Prettier / check formatting                                 |
| `npm run tiles`                     | Cut the tracker pictures into tiles and update the tile map (see below) |
| `npm run plants`                    | Redraw the placeholder plant images (see below)                         |

## Project structure

```
├── assets-src/             Source images that are never served (the full tracker picture)
├── samples/                Example backup files (grown-plant.json: one fully grown plant, ready to plant)
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
    ├── tracker/            Learning tracker state: topics, timer, levels, notes, settings
    ├── pictures/           Tracker pictures: config, generated tile map (tile id → index)
    ├── garden/             Home page garden: plant positions and their limits
    ├── notes/              Date formatting for notes
    ├── backup/             Backup file export, import validation and merging
    ├── plants/             Plant list, growth stages and image paths
    ├── constants/          Shared constants (company name)
    └── media/              Images imported by components (logo)
```

## Pages

| Path       | Component               | Title         |
| ---------- | ----------------------- | ------------- |
| `/`        | `pages/HomePage.vue`    | DoToDo        |
| `/pigeons` | `pages/PigeonsPage.vue` | Pigeons World |
| `/plants`  | `pages/PlantsPage.vue`  | Plants World  |

`/succulents`, the old name of the plants room, redirects to `/plants`.

### Adding a page

1. Create a component in `src/pages/`, for example `FernsPage.vue`.
2. Add a route for it in `src/router.ts`, with a `meta.title` and `meta.description`. The description is applied to the document after each navigation; the tab's title comes from `meta.title` in `App.vue`, which shows the countdown while a session runs.
3. Optionally, add a `<HeaderLink to="/ferns">` to `src/components/AppHeader.vue`.

## Learning tracker (`/pigeons`)

The Pigeons page is a study timer that rewards each session with a piece of a picture and grows a plant for every topic:

1. Click **+ Add topic** on the left. A dialog asks for the title and shows the plants to choose from: Echeveria, Aloe, Jade plant or Cactus. **Create** (or Enter) adds the topic and selects it. Each topic has its own timer, picture and plant. To rename a topic, click ✎ or double-click its name; Enter or clicking away saves, Escape cancels.
2. Start the timer. A chime plays when it ends, and the topic earns one square.
3. Click any dark square and rub it with the mouse or a finger. Once most of it is scratched off, that piece of the pigeon stays revealed. You can switch to a different square until you start scratching; after the first stroke, that square has to be finished before another can be picked.
4. **One full picture (40 squares) is one level.** Finishing it levels the topic up, the plant grows, and you start a fresh picture.
5. **At level 5 the plant flowers and the topic is done.** It moves to the **archive** in the Plants room and leaves the topic list (the page shows a "Fully grown!" message until you pick another topic). A session paused part-way on it is dropped. Its plant also waits in the garden on Home to be planted.

You can study up to **10 topics** at once; archived topics don't count. The topic list shows how many you have ("4 of 10 topics"), and at 10 **+ Add topic** is disabled until one is archived or deleted. Loading or merging a backup can bring in more than 10; nothing is removed, you just can't add more until there's room.

The **Topics** drawer on the left can be collapsed with the arrow button next to its heading: to a narrow strip on wider screens, or folded away on phones. The browser remembers the choice.

Only one timer runs at a time; starting another topic's timer pauses the current one. Topics, timers, levels, notes, garden positions and settings are saved in the browser's `localStorage`. A session that ends while the page is closed still counts the next time the page opens. Saves from before plants, levels or notes existed are upgraded automatically.

### Focus view

Pressing **Start**, or clicking the time, opens the focus view in the middle of the screen: a solid card with the topic, a large timer, **Pause / Resume**, **Back to the page**, and the music controls. The page behind is covered almost completely (95%), so its own timer doesn't show through. Escape or clicking around the card also goes back. When the session ends, the view closes by itself and the page shows "Time's up! Pick a square".

**Music** follows the timer, not the focus view. It plays whenever a session timer runs and the music is switched on: in the focus view, after going back to the page, and on the other pages too. Pausing the timer pauses the music; pressing ▶ while the timer is paused plays it anyway (for a break), and it carries on when the timer resumes. Pausing the music by hand switches it off, also for later sessions, until ▶ is pressed again. It stops when the session ends or is reset.

- **Playlist:** 18 tracks (about 48 minutes): 7 free-to-use tracks from Rusty Lake's early Cube Escape games, 5 calm piano pieces in the spirit of Satie's Gymnopédies and 6 soft lofi tracks. The Gymnopédies and the piano pieces come first, then the calm game pieces, then the lofi, then the more dramatic and upbeat game tracks. They play one after another and start over after the last one. Tap **♥** next to a track's title (or in the header timer) to like it: a liked track is played twice in each round, the second time about half a round later, so never twice in a row. Likes are remembered in this browser.
- **Music controls** appear in the focus view and, while a session is started (running or paused), under the timer on the Pigeons page: previous / play-pause / next track, back to the start of the track, a seek bar with position and length, and volume, with the current track's title. The volume starts at **40%**. Play/pause, volume and the current track are remembered in this browser.
- **Header timer:** while a session is started (running or paused) and you're on another page (Home or Plants), the header shows a small player: the time left (dimmed while paused), plus music previous / play-pause / next track, like and volume. Hovering the time shows the topic; clicking it goes back to the topic on the Pigeons page. On phones it gets its own row under the header.
- The music file is only downloaded the first time it's needed. If a timer is already running when the page loads, the music starts on the first click, because browsers only allow sound after an interaction.
- The player is `src/music/useFocusMusic.ts`. The track list is in `src/music/music.ts` and the files are in `public/music/` (about 32 MB on disk, but only the track that's playing is downloaded). To add a track, put its `.m4a` there, named like its title in lower case with dashes, and add it to `TRACKS` with its credit and the game it comes from.

An hourglass version of the timer (`src/components/tracker/HourglassTimer.vue`) is kept for later but not shown at the moment.

### Credits

The game music is the free-to-use music from Rusty Lake's early **Cube Escape** games (which game uses which track is according to Rusty Lake's blog and its fans). The music of the later Rusty Lake games, from _Rusty Lake Hotel_ on, is by Victor Butzelaar and isn't free to use, so it isn't included.

By **Kevin MacLeod** ([incompetech.com](https://incompetech.com)), licensed under [Creative Commons: By Attribution 4.0](https://creativecommons.org/licenses/by/4.0/):

- "Gymnopedie No 1", "Gymnopedie No 2", "Gymnopedie No 3" (Satie), "Promising Relationship" and "Reign Supreme": _Cube Escape: Seasons_
- "Water Lily": _Cube Escape: The Lake_
- "Hot Swing": _Cube Escape: Birthday_

**Calm piano**: Satie and Chopin, whose music is long out of copyright, in recordings their performers released into the public domain:

- "Gnossienne No 1" and "Gnossienne No 3" (Satie), played by La Pianista: [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Satie_-_Gnossienne_1.ogg), [public domain](https://creativecommons.org/publicdomain/mark/1.0/)
- "Nocturne Op 37 No 2" (Chopin), played by Olga Gurevich for Musopen: [Internet Archive](https://archive.org/details/parso-1c53a71e4ef6f47591ab605d801bc3780b27824a), [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/)
- "Waltz No 19" in A minor, Op. posth. (Chopin), played by Aya Higuchi: [Internet Archive](https://archive.org/details/parso-08e57b88c8badbff300ef033655023e035bbfe2a), CC0 1.0
- "Nocturne in C minor", B. 108 (Chopin), performer not named: [Internet Archive](https://archive.org/details/parso-0376f076666a403745bbb1c79277856a9f5ef9d4), CC0 1.0

**Lofi** by **HoliznaCC0** ([Free Music Archive](https://freemusicarchive.org/music/holiznacc0/)), released as public domain under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) (no conditions; credited anyway), from the album _Public Domain Lofi_: "Infinite Echoes", "Into The Mist", "Ocean Breeze", "Bubbles", "Waiting Around" and "Ease into Night". They were picked by the artist's own mood tags (peaceful, soft, calm, relaxed, dreamy), leaving out tracks tagged dark, sad or retro.

All tracks are re-encoded from MP3 (for the Wikimedia recordings, Wikimedia's own MP3 versions of the Ogg files) to 64 kbps AAC (`.m4a`) to make them smaller. The licences require a credit wherever the music plays, so the music controls always show the current track with its own credit and licence, and the game it's from.

### Notes

The cork board on the right of the Pigeons page holds notes about what you learned in the selected topic. Write a note and click **Pin it** (or press Ctrl/⌘ + Enter). Notes are pinned newest first; click one to read it in full with its date and the level you were at, or to delete it. A note can be **edited only on the day it was written** (by your local date); after midnight it's locked, though it can still be deleted. **Save** (or Ctrl/⌘ + Enter) closes the note. Edited notes are marked "edited". On smaller screens the board moves under the picture.

In the Plants room, each plant has a **specimen record** card under it: the topic, plant, species, growth stage, and all of the topic's notes as dated observations, oldest first. Notes from the same day are grouped under one date. Clicking an observation opens the same note view.

### Settings

**Session length** (45–180 minutes, default 45) is changed with the **hourglass** in the top-right corner of the header, on any page. Timers that haven't been started switch to the new length right away; a running or paused timer finishes with the length it started with.

### Backup: download, load, merge

There's no server: progress lives only in the browser (`localStorage`), so it can be lost if the browser clears site data. Safari, for example, deletes it after 7 days without a visit. The **old folder** icon in the top-right corner of the header (on any page) opens the **Progress file** dialog, which protects against that:

- **Download** saves everything (topics, plants, levels, squares, notes, session log, settings) to `pigeons-world-YYYY-MM-DD.json`. A running timer is saved as paused.
- **Load from file…** checks the file (it must be a Pigeons World backup from this or an older version; broken or unknown fields are cleaned up or skipped) and shows a preview before changing anything. Then you choose:
  - **Merge** (default) combines the file with what's in the browser and never deletes anything. Topics are matched by their id, or else by name (ignoring case). Notes from both sides are combined; a note on both sides keeps its most recently edited version. Levels and squares can't be added up, because both sides may contain the same sessions, so each topic keeps whichever side got further. Topics only in the file are added. This browser's settings and running timer are kept. A plant keeps its place in this browser's garden; if it's only in the file's garden, the file's place is used. Merging the same file twice changes nothing.
  - **Replace…** (asks for confirmation) swaps everything in the browser for the file.
- After a download or load, the app asks the browser to keep its data (`navigator.storage.persist()`). The section shows whether the browser has agreed.
- When there's progress and no backup in the last 7 days, the folder icon gets a **dot** in its top-right corner, and the "Last backup" line in the dialog is highlighted with ⚠. Downloading a backup clears it.

The code is in `src/backup/`: `backup.ts` (file format, validation, merge rules), `persist.ts` and `useBackup.ts`.

### Garden (home page, `/`)

Once a topic's plant is **fully grown** (Flowering, level 5), it can be planted in the garden on the home page:

1. It waits under **Ready to plant**, on the right of the garden (below it on phones).
2. **Drag it onto the grass.** While it's over the garden, it's drawn inside the garden exactly where it will land; let go and it's placed there in its pot. Dragging works with a mouse, a trackpad or a finger. Dropping it outside the garden leaves it in the tray. With the keyboard, Enter places it in the middle of the grass.
3. While it's in its pot, two small buttons sit next to it:
   - **✥ Move**: drag it (or the plant itself) to adjust the spot, or focus it and use the arrow keys (Shift for bigger steps).
   - **Shovel**: after a confirmation, plants it in the ground at that spot. It's then drawn **without its pot** and can't be moved anymore.

Each plant's place is saved with its topic as `garden: { x, y, planted }` (`null` while it waits in the tray) and included in backups, so it appears in the same place every time. x and y are percentages of the garden's width and height, measured at the bottom of the plant's image. The garden keeps a 16 : 9 shape, so a spot looks the same on every screen. Plants lower down are drawn in front; potted plants stay above planted ones, so their buttons can always be reached. Only fully grown plants can be in the garden; a place saved for a younger plant (for example in an edited file) is ignored. Places saved before planting existed count as still in their pot.

The potless images are `public/plants/<plant>/ground.svg`, drawn by `npm run plants` next to the potted stages.

To try it right away, load `samples/grown-plant.json` with **Load from file… → Merge**. It adds a "Botany" topic with a flowering jade plant, waiting under Ready to plant.

### Study log (statistics)

Every finished session is logged on its topic (`sessions`: when it ended and how many minutes it was), saved in the browser and included in backups. When backups are merged, sessions from both sides are combined, each counted once. Saves from before the log existed have no dated sessions, so the statistics start from when the log was added.

The **Study log** board at the top of the Plants room (a chalkboard in a wooden frame) shows, for the last **week**, **month** (the default), **year** or **all time**:

- **Totals:** sessions, time studied, days studied, and the current streak (consecutive days with a session up to today; a day without a session yet doesn't break it until it's over).
- **Sessions per day** (per month for a year or all time) as a bar chart. Hover a bar for the date, sessions and time; the same numbers are in a table for screen readers.
- **By topic:** each topic's sessions and time in the period, with its plant.

The calculations are in `src/stats/stats.ts` and the board is `src/components/stats/StatsBoard.vue`.

### Plants and the room (`/plants`)

The Plants page is a room with every plant still growing on shelves, each with its name and specimen card (stage, level and notes). Clicking a plant opens that topic on the Pigeons page.

Under the shelves, the **Archive** holds the topics whose plant reached its flowering stage: the plant, its name, whether it's planted in the garden yet (links to Home), and its specimen card with all its notes. Archived topics can't be studied any more. Whether a topic is archived isn't saved separately: it follows from its level (`isArchived` in `src/tracker/useTracker.ts`), so older saves and backups need no change. Specimen record numbers follow the order topics were added, across both sections.

Each plant has 5 growth stages, one per level: Seed → Sprout → Young → Mature → Flowering. Reaching Flowering (level 5) archives the topic.

The plant pictures are placeholders drawn by `npm run plants` (`scripts/draw-plants.mjs`) into `public/plants/<plant>/<stage>.svg`, for example `public/plants/aloe/3.svg`. To use real illustrations, replace those 20 files, keeping the names. Each image should be 120 × 160 (or the same 3 : 4 ratio) with the pot at the bottom and the same pot size at every stage, so plants line up on the shelf. To use PNG or WebP instead of SVG, change the extension in `plantImage` in `src/plants/plants.ts`. The plant list itself is in the same file.

### How the picture loads

The full photo (`assets-src/pigeon.jpg`) is never sent to the browser. `npm run tiles` cuts each picture into square tiles, and the page only requests a tile once its square is picked for scratching or has already been revealed.

Tiles are identified by **id**, not by position:

- `src/pictures/pictures.json` (edit by hand) lists the pictures: name, source image, grid size (`cols` × `rows`, 8 × 5 for the pigeon) and where the crop starts vertically (`cropTopShare`).
- `src/pictures/tile-map.json` (generated, don't edit) maps each tile id to its **index** in the grid, counted row by row from the top left. For example, an entry with index `20` is row 3, column 5. For every tile, `npm run tiles` first generates its id, then names the file after it and adds `id → index` to the map. The map is rebuilt from scratch on every run and is never read by the script.
- Tile files are named by id: `public/tiles/<picture>/<tile id>.webp`. Their names don't give away where they go.

Each topic saves the **picture** it's revealing (`pictureId`) and the **tile ids** it has revealed. When a picture is finished, the next one in `pictures.json` starts, going back to the first after the last.

Ids are generated from the source image, the picture's settings (id, grid size, crop) and the tile's index. Running `npm run tiles` again on the same picture therefore gives the same ids, so saved progress stays valid. Changing the image, grid size or crop gives new ids, because the tiles themselves are different; progress already saved on that picture won't carry over. To add a picture, put the image in `assets-src/`, add an entry to `pictures.json` and run `npm run tiles`.

Older saves and version 1 backup files, which stored revealed squares as grid indexes, are converted to tile ids automatically.

### Testing faster

In development, add `?minutes=0.1` to the URL (for example `http://localhost:5173/pigeons?minutes=0.1`) to make a session last 6 seconds. It overrides the session length setting and is ignored in production builds.

To try the garden without growing a plant, open `http://localhost:5173/?test-plant`. It adds a "Test topic" with a fully grown echeveria waiting under **Ready to plant** (and in the archive on the Plants page). Opening the link again puts it back in the tray, so you can plant it again; it never adds a second one. Also ignored in production builds.

## Styling

### Colour theme

All colours live in one file, **`src/theme/colors.js`**: the main palette (navy, slate, lilac, greens) and the supporting colours for the cork board, wood, plants and index-card paper. Tailwind's default colours are replaced by this theme, plus `transparent` and `current`.

`tailwind.config.js` turns each colour into:

- a **CSS variable** on `:root`, for example `--color-navy: 32 39 52`;
- a **Tailwind colour** pointing at that variable, so `bg-navy`, `text-lilac`, `border-green-dark`, `fill-cork`, `stroke-wood` and opacity modifiers like `bg-navy/40` all work.

How to use a theme colour:

| Where                                         | How                                                                                               |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Templates                                     | Tailwind classes: `bg-navy`, `text-green-pale/50`, `fill-green-mid`, `stroke-cork-deep`           |
| CSS (`<style>`, `global.css`)                 | `rgb(var(--color-cork))`, or `theme("colors.navy")`                                               |
| SVG gradients                                 | `style="stop-color: rgb(var(--color-lilac-mist))"`                                                |
| Code that needs a colour string (e.g. canvas) | `themeColor("navy")` from `src/theme/theme.ts`                                                    |
| Generated images                              | `scripts/draw-plants.mjs` imports `colors.js`; run `npm run plants` after changing a plant colour |

To change a colour, edit it in `colors.js`; everything using it follows. The running dev server restarts by itself when `colors.js` or `tailwind.config.js` changes, because Tailwind only reads its config at startup. Two places can't read CSS and keep literal copies of colours: the `theme-color` meta tag in `index.html` (navy) and `public/manifest.json` (navy, and `pigeon-mist` as the splash background).

| Colour                                                                   | Hex                             | Used for                                                                                        |
| ------------------------------------------------------------------------ | ------------------------------- | ----------------------------------------------------------------------------------------------- |
| `navy`                                                                   | `#202734`                       | Header, footer, page background, hidden squares                                                 |
| `slate`                                                                  | `#36415A`                       | Pigeons page background, dialogs                                                                |
| `lilac`                                                                  | `#C9B8E8`                       | Pigeons accents, buttons, pots, reminder dot                                                    |
| `green-dark`                                                             | `#2F4B26`                       | Plant outlines                                                                                  |
| `green-mid`                                                              | `#7FA65E`                       | Garden grass, darker leaves                                                                     |
| `green-light`                                                            | `#B7D894`                       | Accents, leaves                                                                                 |
| `green-pale`                                                             | `#E0F8C7`                       | Notes, light text                                                                               |
| `pigeon-mist`, `pigeon-lavender`                                         | `#EEE6F4`, `#CDB6DE`            | Home and Plants room backgrounds (`.bg-dove`, `.bg-room` in `global.css`), distant garden hills |
| `white`                                                                  | `#FFFFFF`                       | Music player text, specimen record headers                                                      |
| `plum`                                                                   | `#3F2A52`                       | Plants room text                                                                                |
| `succulent-blush`, `succulent-peach`                                     | `#F2CDC6`, `#EDB896`            | Pink and peach at the bottom of the Plants room (`.bg-room`)                                    |
| `pigeon-grey`, `pigeon-purple`, `pigeon-teal`                            | `#4D576B`, `#7E4F93`, `#2E7A73` | Pigeons page background (`.bg-pigeon` in `global.css`)                                          |
| `cork`, `cork-light`, `cork-dark`, `cork-deep`, `wood`                   | browns                          | Cork board, hourglass, old folder                                                               |
| `paper`, `rule-blue`, `rule-red`                                         |                                 | Specimen index cards                                                                            |
| `lilac-mist`, `lilac-shade`, `lilac-deep`, `green-mist`, `seed`, `trunk` |                                 | Garden sky, pot rims, flowers, seeds, jade trunk                                                |

### Header and page backgrounds

The header looks the same on every page: a dark navy bar (85% opaque, so the page's colours tint it a little) with white **Pigeons** and **Plants** links, the current page's link underlined in lilac. Each page's background runs up behind it. The background is set per route (`meta.background` in `src/router.ts`: `bg-dove` for Home, `bg-pigeon` for Pigeons, `bg-room` for Plants: all in pigeon colours, pale on Home and Plants) and applied around the header and page in `App.vue`.

### Fonts

The site uses typewriter-style fonts, bundled through [Fontsource](https://fontsource.org/) so they work offline:

- **Courier Prime** (`font-typewriter`): body text, links and the footer. It's the default font for the whole page.
- **Special Elite** (`font-display`): headings (`h1`–`h3`). It has a worn, inked look.

> After changing `tailwind.config.js`, restart the dev server. A server that is already running may keep using the old config, so new classes won't show up.

## Deployment

`npm run build` produces a static single-page app in `dist/` that any static host can serve. The router uses HTML5 history mode, so the host must send `index.html` for any path that isn't a real file. Otherwise, opening `/pigeons` directly returns a 404. See the [Vue Router guide](https://router.vuejs.org/guide/essentials/history-mode.html#Example-Server-Configurations) for example server configurations.
