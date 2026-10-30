// "Sat, 25 Oct": compact, for pinned notes.
export const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

// "Saturday, 25 October 2026": for the full note view.
export const longDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

// "2026-10-25": record style, for specimen cards. Uses the local date, not UTC.
export const recordDate = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// Notes can only be edited on the (local) day they were written.
export const isToday = (iso: string) =>
  recordDate(iso) === recordDate(new Date().toISOString());

// A stable small tilt per note, so the board looks hand-pinned but doesn't jump around.
export function tiltFor(id: string) {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return ((Math.abs(hash) % 7) - 3) * 0.8;
}

// A stable small offset per note (px), so notes look scattered over the board rather than
// lined up in a grid.
export function scatterFor(id: string) {
  let hash = 7;
  for (const char of id) hash = (hash * 17 + char.charCodeAt(0)) | 0;
  const n = Math.abs(hash);
  return { x: (n % 13) - 6, y: Math.floor(n / 13) % 15 };
}
