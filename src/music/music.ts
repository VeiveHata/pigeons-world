// Background music for focus sessions: calm instrumental tracks by Kevin MacLeod,
// served from public/music/. They're licensed CC BY 4.0, which allows use in apps and
// websites as long as the credit is shown wherever the music plays (see NowPlaying.vue)
// and in the README. Re-encoded from the original MP3s to 64 kbps AAC (.m4a) to keep
// them small.

export const ARTIST = {
  name: "Kevin MacLeod",
  site: "incompetech.com",
  url: "https://incompetech.com",
};

export const LICENSE = {
  name: "CC BY 4.0",
  url: "https://creativecommons.org/licenses/by/4.0/",
};

export type Track = {
  title: string;
  src: string;
};

const track = (title: string): Track => ({
  title,
  src: `/music/${title.toLowerCase().replace(/ /g, "-")}.m4a`,
});

// Played in this order, starting over after the last one.
export const TRACKS: Track[] = [
  track("Meditation Impromptu 01"),
  track("Gymnopedie No 1"),
  track("Bathed in the Light"),
  track("Dreamer"),
  track("Meditation Impromptu 02"),
  track("Floating Cities"),
  track("Frost Waltz"),
  track("Clean Soul"),
  track("Dream Culture"),
  track("Meditation Impromptu 03"),
  track("Crinoline Dreams"),
  track("Wallpaper"),
  track("Peaceful Desolation"),
];
