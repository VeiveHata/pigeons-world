// Pictures and their tiles are configured in src/pictures/.
// One square per finished session; a full picture is one level.

export const DEFAULT_SESSION_MINUTES = 45;
export const MIN_SESSION_MINUTES = 45;
export const MAX_SESSION_MINUTES = 180;

export const clampMinutes = (minutes: number) =>
  Math.round(
    Math.min(MAX_SESSION_MINUTES, Math.max(MIN_SESSION_MINUTES, minutes)),
  );

// In development, `?minutes=0.1` overrides the session length setting so the flow can be tested quickly.
const devMinutes = import.meta.env.DEV
  ? Number(new URLSearchParams(location.search).get("minutes"))
  : NaN;

export const DEV_SESSION_MINUTES = devMinutes > 0 ? devMinutes : null;
