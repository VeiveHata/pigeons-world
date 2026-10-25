// Background music for focus sessions, served from public/music/. Every track may be used
// in apps and websites; some licences require a credit, so every track is credited wherever
// it plays (see NowPlaying.vue) and all tracks are listed in the README.
// Files are re-encoded from the original MP3s to 64 kbps AAC (.m4a) to keep them small.

export type Credit = {
  // Who to credit, and where they or the recording can be found.
  by: string;
  site: string;
  url: string;
  license: string;
  licenseUrl: string;
};

export type Track = {
  title: string;
  src: string;
  credit: Credit;
  // The Rusty Lake game that uses this track, if any.
  game?: string;
};

const CC_BY_4 = {
  license: "CC BY 4.0",
  licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
};

const MACLEOD: Credit = {
  by: "Kevin MacLeod",
  site: "incompetech.com",
  url: "https://incompetech.com",
  ...CC_BY_4,
};

// Musopen's recording, published as public domain (CC0) on the Internet Archive and as
// CC BY 4.0 on IMSLP; credited in the CC BY way, which satisfies both.
const MUSOPEN_EGMONT: Credit = {
  by: "Ludwig van Beethoven, recorded by Musopen",
  site: "musopen.org",
  url: "https://musopen.org/music/13441",
  ...CC_BY_4,
};

// Soft lofi released as public domain (CC0) on the Free Music Archive, so no conditions;
// credited anyway.
const HOLIZNA: Credit = {
  by: "HoliznaCC0",
  site: "freemusicarchive.org",
  url: "https://freemusicarchive.org/music/holiznacc0/",
  license: "CC0 (public domain)",
  licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
};

const track = (title: string, credit: Credit, game?: string): Track => ({
  title,
  src: `/music/${title.toLowerCase().replace(/ /g, "-")}.m4a`,
  credit,
  game,
});

// The free-to-use music from Rusty Lake's early Cube Escape games, plus soft lofi.
// Played in this order, starting over after the last one: calm pieces first, then the
// lofi, then the more dramatic and upbeat game tracks.
export const TRACKS: Track[] = [
  track("Gymnopedie No 1", MACLEOD, "Cube Escape: Seasons"),
  track("Gymnopedie No 2", MACLEOD, "Cube Escape: Seasons"),
  track("Gymnopedie No 3", MACLEOD, "Cube Escape: Seasons"),
  track("Water Lily", MACLEOD, "Cube Escape: The Lake"),
  track("Promising Relationship", MACLEOD, "Cube Escape: Seasons"),
  track("Calm Currents", HOLIZNA),
  track("Peaceful Drift", HOLIZNA),
  track("Infinite Echoes", HOLIZNA),
  track("Into The Mist", HOLIZNA),
  track("Ocean Breeze", HOLIZNA),
  track("Tranquil Mindscape", HOLIZNA),
  track("Bubbles", HOLIZNA),
  track("Waiting Around", HOLIZNA),
  track("Ease into Night", HOLIZNA),
  track("Reign Supreme", MACLEOD, "Cube Escape: Seasons"),
  track("Hot Swing", MACLEOD, "Cube Escape: Birthday"),
  track("Egmont Overture", MUSOPEN_EGMONT, "Cube Escape: Seasons"),
];
