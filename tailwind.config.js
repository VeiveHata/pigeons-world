import plugin from "tailwindcss/plugin";
import { colors, toRgbChannels } from "./src/theme/colors.js";

const names = Object.keys(colors);

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts}"],
  theme: {
    // Only the theme's colours (see src/theme/colors.js), each backed by a CSS variable,
    // so opacity modifiers like `bg-navy/40` keep working.
    colors: {
      transparent: "transparent",
      current: "currentColor",
      ...Object.fromEntries(
        names.map((name) => [
          name,
          `rgb(var(--color-${name}) / <alpha-value>)`,
        ]),
      ),
    },
    extend: {
      fontFamily: {
        // Body text: clean typewriter face, readable at small sizes
        typewriter: [
          '"Courier Prime"',
          '"Courier New"',
          "Courier",
          "monospace",
        ],
        // Headings: worn, inked typewriter look
        display: [
          '"Special Elite"',
          '"Courier Prime"',
          '"Courier New"',
          "monospace",
        ],
      },
    },
  },
  plugins: [
    // Defines the CSS variables the colours above point to.
    plugin(({ addBase }) => {
      addBase({
        ":root": Object.fromEntries(
          names.map((name) => [`--color-${name}`, toRgbChannels(colors[name])]),
        ),
      });
    }),
  ],
};
