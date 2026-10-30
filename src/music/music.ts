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

// Soft lofi released as public domain (CC0) on the Free Music Archive, so no conditions;
// credited anyway.
const HOLIZNA: Credit = {
  by: "HoliznaCC0",
  site: "freemusicarchive.org",
  url: "https://freemusicarchive.org/music/holiznacc0/",
  license: "CC0 (public domain)",
  licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
};

// Calm piano pieces in the spirit of the Gymnopédies. The music itself is long out of
// copyright; these recordings were released into the public domain by their performers.
const PUBLIC_DOMAIN = {
  license: "Public domain",
  licenseUrl: "https://creativecommons.org/publicdomain/mark/1.0/",
};

const CC0 = {
  license: "CC0 (public domain)",
  licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
};

const commons = (by: string, file: string): Credit => ({
  by,
  site: "Wikimedia Commons",
  url: `https://commons.wikimedia.org/wiki/File:${file}`,
  ...PUBLIC_DOMAIN,
});

const archive = (by: string, item: string): Credit => ({
  by,
  site: "Internet Archive",
  url: `https://archive.org/details/${item}`,
  ...CC0,
});

const track = (title: string, credit: Credit, game?: string): Track => ({
  title,
  src: `/music/${title.toLowerCase().replace(/ /g, "-")}.m4a`,
  credit,
  game,
});

// The free-to-use music from Rusty Lake's early Cube Escape games, calm piano and soft lofi.
// Played in this order, starting over after the last one: calm pieces first, then the
// lofi, then the more dramatic and upbeat game tracks.
export const TRACKS: Track[] = [
  track("Gymnopedie No 1", MACLEOD, "Cube Escape: Seasons"),
  track("Gymnopedie No 2", MACLEOD, "Cube Escape: Seasons"),
  track("Gymnopedie No 3", MACLEOD, "Cube Escape: Seasons"),
  track(
    "Gnossienne No 1",
    commons("Satie, played by La Pianista", "Satie_-_Gnossienne_1.ogg"),
  ),
  track(
    "Gnossienne No 3",
    commons("Satie, played by La Pianista", "Gnossienne_3_(Satie).ogg"),
  ),
  track(
    "Nocturne Op 37 No 2",
    archive(
      "Chopin, played by Olga Gurevich",
      "parso-1c53a71e4ef6f47591ab605d801bc3780b27824a",
    ),
  ),
  track(
    "Waltz No 19",
    archive(
      "Chopin, played by Aya Higuchi",
      "parso-08e57b88c8badbff300ef033655023e035bbfe2a",
    ),
  ),
  track(
    "Nocturne in C minor",
    archive("Chopin", "parso-0376f076666a403745bbb1c79277856a9f5ef9d4"),
  ),
  track("Water Lily", MACLEOD, "Cube Escape: The Lake"),
  track("Promising Relationship", MACLEOD, "Cube Escape: Seasons"),
  track("Infinite Echoes", HOLIZNA),
  track("Into The Mist", HOLIZNA),
  track("Ocean Breeze", HOLIZNA),
  track("Bubbles", HOLIZNA),
  track("Waiting Around", HOLIZNA),
  track("Ease into Night", HOLIZNA),
  track("Reign Supreme", MACLEOD, "Cube Escape: Seasons"),
  track("Hot Swing", MACLEOD, "Cube Escape: Birthday"),
];
