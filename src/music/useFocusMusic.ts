import { computed, ref, watch } from "vue";
import { isStarted, useTracker } from "@/tracker/useTracker";
import { TRACKS } from "./music";

// One music player for the whole app. It plays while any session timer runs and the
// music is switched on, whether or not the focus view is open, so it keeps going after
// you return to the page and stops when the timer is paused or the session ends.
// The tracks play in order as a playlist, starting over after the last one.

const MUSIC_KEY = "pigeons-world.focus-music";
const VOLUME_KEY = "pigeons-world.focus-volume";
const TRACK_KEY = "pigeons-world.focus-track";
const LIKES_KEY = "pigeons-world.focus-likes";
// Quiet by default, so it stays in the background.
const DEFAULT_VOLUME = 0.4;

function read(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function remember(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Just won't be remembered.
  }
}

function readVolume() {
  const saved = Number(read(VOLUME_KEY));
  return read(VOLUME_KEY) !== null && saved >= 0 && saved <= 1
    ? saved
    : DEFAULT_VOLUME;
}

// The last track played, remembered by title so reordering the list doesn't matter.
function readTrackIndex() {
  const index = TRACKS.findIndex((t) => t.title === read(TRACK_KEY));
  return index >= 0 ? index : 0;
}

// Liked tracks, by title.
function readLikes(): string[] {
  try {
    const saved: unknown = JSON.parse(read(LIKES_KEY) ?? "[]");
    // Only titles still in the playlist (a removed track's like is dropped).
    return Array.isArray(saved)
      ? saved.filter(
          (t): t is string =>
            typeof t === "string" && TRACKS.some((track) => track.title === t),
        )
      : [];
  } catch {
    return [];
  }
}

// On by default; the choice, volume, track and likes are remembered in this browser only.
const musicOn = ref(read(MUSIC_KEY) !== "off");
const trackIndex = ref(readTrackIndex());
const track = computed(() => TRACKS[trackIndex.value]);
const likes = ref(readLikes());
const liked = computed(() => likes.value.includes(track.value.title));

// The play order, as indexes into TRACKS: every track once, in list order, plus a second
// play of each liked track about half a round later. So liked tracks come up twice as
// often, but never twice in a row.
const queue = computed(() => {
  const n = TRACKS.length;
  const half = Math.ceil(n / 2);
  const order: number[] = [];
  for (let k = 0; k < n; k++) {
    order.push(k);
    const again = (k + half) % n;
    if (again !== k && likes.value.includes(TRACKS[again].title)) {
      order.push(again);
    }
  }
  return order;
});
// Where in the queue we are (a liked track appears in it twice).
let queuePosition = Math.max(0, queue.value.indexOf(trackIndex.value));
const volume = ref(readVolume());
const playing = ref(false);
// Where the track is, in seconds, for the seek bar.
const position = ref(0);
const duration = ref(0);

let audio: HTMLAudioElement | null = null;
// Whether music should be playing right now: a timer runs and music is on.
let wanted = () => false;

// Development only: when this file is edited, the dev server loads a new copy of it, but
// the old copy keeps running. Without this, each copy would have its own player playing at
// once, and the switch would only control the newest one. So each copy takes a generation
// number on the page; a newer copy silences the older player, and older copies never
// play again.
const shared = globalThis as {
  __pigeonsMusic?: { generation: number; audio: HTMLAudioElement | null };
};
shared.__pigeonsMusic?.audio?.pause();
const generation = (shared.__pigeonsMusic?.generation ?? 0) + 1;
shared.__pigeonsMusic = { generation, audio: null };
const isCurrent = () => shared.__pigeonsMusic?.generation === generation;

// Created on first use, so the file is only downloaded once music is wanted.
function player() {
  if (!audio) {
    audio = new Audio(track.value.src);
    shared.__pigeonsMusic!.audio = audio;
    audio.volume = volume.value;
    audio.addEventListener("play", () => (playing.value = true));
    audio.addEventListener("pause", () => (playing.value = false));
    audio.addEventListener(
      "timeupdate",
      () => (position.value = audio!.currentTime),
    );
    audio.addEventListener("durationchange", () => {
      if (Number.isFinite(audio!.duration)) duration.value = audio!.duration;
    });
    // At the end of a track, go on to the next one.
    audio.addEventListener("ended", () => step(1));
  }
  return audio;
}

// Browsers only allow sound after the user has interacted with the page. If a timer is
// already running when the page loads, the first click anywhere starts the music.
function play() {
  if (!isCurrent()) {
    audio?.pause();
    return;
  }
  player()
    .play()
    .catch(() => {
      window.addEventListener(
        "pointerdown",
        () => {
          if (isCurrent() && musicOn.value && !playing.value) {
            void player()
              .play()
              .catch(() => {});
          }
        },
        { once: true },
      );
    });
}

let started = false;

function startWatching() {
  const { topics } = useTracker();
  const anyRunning = computed(() =>
    topics.value.some((t) => t.timer.endsAt !== null),
  );

  wanted = () => anyRunning.value && musicOn.value;

  // Starting or resuming the timer starts the music (if it's on); pausing it, or the
  // session ending, pauses the music.
  watch(
    anyRunning,
    (running) => {
      if (running && musicOn.value) play();
      else audio?.pause();
    },
    { immediate: true },
  );

  // No session started any more (finished or reset): the controls are hidden, so the
  // music stops too, even if it was playing during a pause.
  const anyStarted = computed(() => topics.value.some(isStarted));
  watch(anyStarted, (started) => {
    if (!started) audio?.pause();
  });

  watch(musicOn, (on) => {
    remember(MUSIC_KEY, on ? "on" : "off");
    if (!on) audio?.pause();
    else if (anyRunning.value) play();
  });
  watch(likes, (titles) => remember(LIKES_KEY, JSON.stringify(titles)), {
    deep: true,
  });

  watch(volume, (value) => {
    if (audio) audio.volume = value;
    remember(VOLUME_KEY, String(value));
  });
}

// Moves through the queue (wrapping around) and plays that track.
function step(delta: number) {
  const order = queue.value;
  // Liking or unliking changes the queue, so find the current track in it again.
  const here =
    order[queuePosition] === trackIndex.value
      ? queuePosition
      : Math.max(0, order.indexOf(trackIndex.value));
  queuePosition = (here + delta + order.length) % order.length;
  selectTrack(order[queuePosition]);
}

// Switches to a track and keeps playing if music is wanted.
function selectTrack(index: number) {
  trackIndex.value = index;
  remember(TRACK_KEY, track.value.title);
  position.value = 0;
  duration.value = 0;
  if (audio) audio.src = track.value.src;
  if (wanted()) play();
}

// Jumps to a point in the track (seconds).
function seek(seconds: number) {
  if (!audio || !duration.value) return;
  audio.currentTime = Math.min(duration.value, Math.max(0, seconds));
  position.value = audio.currentTime;
}

function restart() {
  seek(0);
}

// Likes or unlikes the current track (a liked track is played twice as often).
function toggleLike() {
  const title = track.value.title;
  likes.value = liked.value
    ? likes.value.filter((t) => t !== title)
    : [...likes.value, title];
}

// The play/pause button follows what you hear. Pausing switches the music off (also for
// the next sessions); playing switches it on and starts it right away, even while the
// timer is paused, e.g. for a break.
function toggleMusic() {
  if (playing.value) {
    musicOn.value = false;
    return;
  }
  musicOn.value = true;
  play();
}

export function useFocusMusic() {
  if (!started) {
    started = true;
    startWatching();
  }
  return {
    musicOn,
    volume,
    playing,
    position,
    duration,
    seek,
    restart,
    track,
    liked,
    toggleLike,
    nextTrack: () => step(1),
    previousTrack: () => step(-1),
    toggleMusic,
  };
}
