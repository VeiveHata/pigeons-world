import grid from "./grid.json";

export const COLS = grid.cols;
export const ROWS = grid.rows;
// One square per finished session; a full picture is one level.
export const TILE_COUNT = COLS * ROWS;

export const tileUrl = (index: number) => `${grid.tileDir}/${index}.webp`;

export const DEFAULT_SESSION_MINUTES = 45;
export const MIN_SESSION_MINUTES = 1;
export const MAX_SESSION_MINUTES = 180;

// In development, `?minutes=0.1` overrides the session length setting so the flow can be tested quickly.
const devMinutes = import.meta.env.DEV
  ? Number(new URLSearchParams(location.search).get("minutes"))
  : NaN;

export const DEV_SESSION_MINUTES = devMinutes > 0 ? devMinutes : null;
