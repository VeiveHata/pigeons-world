// The app's colour theme: the single place where colours are defined.
//
// tailwind.config.js turns each entry into a CSS variable on :root (`--color-navy: 32 39 52`)
// and a Tailwind colour (`bg-navy`, `text-navy/50`, `fill-navy`, `stroke-navy`, …).
// Outside utility classes, use the variable: `rgb(var(--color-navy))` in CSS, or
// `themeColor("navy")` from src/theme/theme.ts in code (e.g. for a canvas).
// scripts/draw-plants.mjs reads these too, so the plant art stays on-theme.
//
// Plain JavaScript (not TS or JSON) so Tailwind, Node scripts and the app can all import it.

export const colors = {
  // Brand: header, footer, pages
  navy: "#202734",
  slate: "#36415A",
  lilac: "#C9B8E8",
  "lilac-mist": "#DCD0F0",
  "lilac-shade": "#B3A0D6",
  "lilac-deep": "#9B7FCF",
  "green-dark": "#2F4B26",
  "green-mid": "#7FA65E",
  "green-light": "#B7D894",
  "green-pale": "#E0F8C7",
  "green-mist": "#F4FCEC",

  // City pigeon: blue-grey feathers and the purple-to-teal sheen on the neck
  "pigeon-grey": "#4D576B",
  "pigeon-purple": "#7E4F93",
  "pigeon-teal": "#2E7A73",

  // Echeveria rosette: mint and sage at the heart, blush and peach at the leaf tips
  "succulent-mint": "#D6E8CF",
  "succulent-sage": "#AFCBA6",
  "succulent-blush": "#F2CDC6",
  "succulent-peach": "#EDB896",

  // Cork board, old folder and hourglass wood
  "cork-light": "#D2A877",
  cork: "#B98A5E",
  "cork-dark": "#9C7148",
  "cork-deep": "#8A6240",
  wood: "#5F4329",

  // Notes board: dark wooden frame with iron corner brackets, photo-print notes held by
  // silver binder clips
  "frame-wood": "#4B3B31",
  "frame-wood-light": "#6B5546",
  iron: "#26221F",
  silver: "#C9CDD3",
  "silver-dark": "#8C929A",
  "photo-paper": "#F6F1E6",
  // The back of a folded paper corner, a shade darker than the front
  "photo-paper-fold": "#DED5C3",

  // Study log chalkboard in the Plants room: board, chalk writing, and the bar colour
  // (checked for lightness, colourfulness and contrast against the board)
  chalkboard: "#2F3A33",
  chalk: "#F2F0E6",
  "chalk-green": "#72A653",

  // Plants: seed and jade trunk
  seed: "#8A6E4B",
  trunk: "#6B5B45",

  // Index card paper: background, ruled lines, margin line
  paper: "#FBFAF2",
  "rule-blue": "#B9CDE3",
  "rule-red": "#E3A3A3",
};

// "#202734" -> "32 39 52", the form CSS variables use so Tailwind can add opacity.
export const toRgbChannels = (hex) =>
  [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(" ");
