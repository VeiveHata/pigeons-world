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

// In development, `?test-plant` adds a "Test topic" with a fully grown plant waiting to be
// planted (or puts it back in the tray if it's already there), to try the garden.
export const DEV_TEST_PLANT =
  import.meta.env.DEV && new URLSearchParams(location.search).has("test-plant");
