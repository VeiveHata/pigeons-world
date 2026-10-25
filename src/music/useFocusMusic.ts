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

// On by default; the choice, volume and track are remembered in this browser only.
const musicOn = ref(read(MUSIC_KEY) !== "off");
const trackIndex = ref(readTrackIndex());
const track = computed(() => TRACKS[trackIndex.value]);
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
    audio.addEventListener("ended", () => selectTrack(trackIndex.value + 1));
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
  watch(volume, (value) => {
    if (audio) audio.volume = value;
    remember(VOLUME_KEY, String(value));
  });
}

// Switches to a track (wrapping around the list) and keeps playing if music is wanted.
function selectTrack(index: number) {
  trackIndex.value = (index + TRACKS.length) % TRACKS.length;
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
    nextTrack: () => selectTrack(trackIndex.value + 1),
    previousTrack: () => selectTrack(trackIndex.value - 1),
    toggleMusic,
  };
}
