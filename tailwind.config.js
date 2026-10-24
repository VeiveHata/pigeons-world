/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts}'],
  theme: {
    colors: {
      // Site-wide
      'navy': '#202734',
      'green-light': '#B7D894',
      'green-pale': '#E0F8C7',
      // Pigeons
      'slate': '#36415A',
      'lilac': '#C9B8E8',
      // Succulents
      'green-dark': '#2F4B26',
    },
    extend: {
      fontFamily: {
        // Body text: clean typewriter face, readable at small sizes
        typewriter: ['"Courier Prime"', '"Courier New"', 'Courier', 'monospace'],
        // Headings: worn, inked typewriter look
        display: ['"Special Elite"', '"Courier Prime"', '"Courier New"', 'monospace'],
      },
    },
  },
  plugins: [],
}
