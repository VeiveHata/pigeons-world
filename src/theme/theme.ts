// A theme colour as a CSS colour string, read from its CSS variable (see colors.js).
// For places that can't use Tailwind classes or `rgb(var(--color-…))`, like a canvas.
export function themeColor(name: string) {
  const channels = getComputedStyle(document.documentElement)
    .getPropertyValue(`--color-${name}`)
    .trim()
    .split(/\s+/);
  return `rgb(${channels.join(", ")})`;
}
