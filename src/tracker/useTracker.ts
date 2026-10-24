import { computed, reactive, ref, watch } from "vue";
import { PLANTS, type PlantId } from "@/plants/plants";
import {
  DEFAULT_SESSION_MINUTES,
  DEV_SESSION_MINUTES,
  MAX_SESSION_MINUTES,
  MIN_SESSION_MINUTES,
  TILE_COUNT,
} from "./config";

export type Topic = {
  id: string;
  title: string;
  plantId: PlantId;
  // Full pictures finished; the topic's level is this plus one.
  picturesCompleted: number;
  // Tile indexes that have been fully scratched off in the current picture.
  revealed: number[];
  // Finished sessions not yet spent on a tile.
  credits: number;
  timer: {
    // Set while running; the timer counts down to this moment.
    endsAt: number | null;
    // Used while paused or idle.
    remainingMs: number;
  };
};

type Settings = {
  sessionMinutes: number;
};

type State = {
  topics: Topic[];
  selectedId: string | null;
  settings: Settings;
};

const STORAGE_KEY = "pigeons-world.tracker.v1";

function sessionMsFor(settings: Settings) {
  return (DEV_SESSION_MINUTES ?? settings.sessionMinutes) * 60 * 1000;
}

function newTopic(title: string, plantId: PlantId, settings: Settings): Topic {
  return {
    id: crypto.randomUUID(),
    title,
    plantId,
    picturesCompleted: 0,
    revealed: [],
    credits: 0,
    timer: { endsAt: null, remainingMs: sessionMsFor(settings) },
  };
}

type SavedState = Partial<
  Omit<State, "topics"> & {
    // Saves from before plants and levels lack those fields.
    topics: (Omit<Topic, "plantId" | "picturesCompleted"> & Partial<Topic>)[];
  }
>;

// Fills in fields added after a save was written, so older progress keeps working.
function normalize(saved: SavedState): State {
  const settings = {
    sessionMinutes: DEFAULT_SESSION_MINUTES,
    ...saved.settings,
  };
  const topics = (saved.topics ?? []).map((topic, i): Topic => ({
    ...topic,
    plantId: topic.plantId ?? PLANTS[i % PLANTS.length].id,
    picturesCompleted: topic.picturesCompleted ?? 0,
  }));
  return {
    topics,
    selectedId: saved.selectedId ?? topics[0]?.id ?? null,
    settings,
  };
}

function load(): State {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return normalize(JSON.parse(saved));
  } catch {
    // Storage blocked or corrupted: start fresh.
  }
  const settings = { sessionMinutes: DEFAULT_SESSION_MINUTES };
  const topics = [
    newTopic("Vue", "echeveria", settings),
    newTopic("TypeScript", "aloe", settings),
    newTopic("Tailwind CSS", "jade", settings),
  ];
  return { topics, selectedId: topics[0].id, settings };
}

const state = reactive<State>(load());
const now = ref(Date.now());
const justFinished = ref<string | null>(null);
const justLeveledUp = ref<string | null>(null);

watch(
  state,
  () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Progress just won't survive a reload.
    }
  },
  { deep: true },
);

const sessionMs = () => sessionMsFor(state.settings);

function playChime() {
  try {
    const audio = new AudioContext();
    [660, 880].forEach((frequency, i) => {
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      const start = audio.currentTime + i * 0.25;
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0.2, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.6);
      osc.connect(gain).connect(audio.destination);
      osc.start(start);
      osc.stop(start + 0.6);
    });
  } catch {
    // No audio available.
  }
}

function finishSession(topic: Topic) {
  topic.credits++;
  topic.timer = { endsAt: null, remainingMs: sessionMs() };
  justFinished.value = topic.id;
  playChime();
}

// One clock for the whole app. Also catches sessions that ended while the app was closed.
function tick() {
  now.value = Date.now();
  for (const topic of state.topics) {
    if (topic.timer.endsAt !== null && topic.timer.endsAt <= now.value) {
      finishSession(topic);
    }
  }
}
tick();
setInterval(tick, 250);

export function remainingMs(topic: Topic) {
  const { endsAt, remainingMs } = topic.timer;
  return endsAt === null ? remainingMs : Math.max(0, endsAt - now.value);
}

export const levelOf = (topic: Topic) => topic.picturesCompleted + 1;

export function useTracker() {
  const selected = computed(
    () => state.topics.find((t) => t.id === state.selectedId) ?? null,
  );

  function select(id: string) {
    state.selectedId = id;
  }

  function addTopic(title: string, plantId: PlantId) {
    const topic = newTopic(title.trim(), plantId, state.settings);
    state.topics.push(topic);
    state.selectedId = topic.id;
  }

  function renameTopic(id: string, title: string) {
    const topic = state.topics.find((t) => t.id === id);
    if (topic && title.trim()) topic.title = title.trim();
  }

  function removeTopic(id: string) {
    state.topics = state.topics.filter((t) => t.id !== id);
    if (state.selectedId === id) state.selectedId = state.topics[0]?.id ?? null;
  }

  // Only one session runs at a time: starting one pauses any other.
  function start(topic: Topic) {
    for (const other of state.topics) {
      if (other !== topic && other.timer.endsAt !== null) pause(other);
    }
    topic.timer.endsAt = Date.now() + topic.timer.remainingMs;
    justFinished.value = null;
  }

  function pause(topic: Topic) {
    topic.timer = { endsAt: null, remainingMs: remainingMs(topic) };
  }

  function reset(topic: Topic) {
    topic.timer = { endsAt: null, remainingMs: sessionMs() };
  }

  function reveal(topic: Topic, index: number) {
    if (topic.credits < 1 || topic.revealed.includes(index)) return;
    topic.revealed.push(index);
    topic.credits--;
    if (topic.revealed.length >= TILE_COUNT) {
      topic.picturesCompleted++;
      justLeveledUp.value = topic.id;
    }
  }

  function startNextPicture(topic: Topic) {
    topic.revealed = [];
    justLeveledUp.value = null;
  }

  const isComplete = (topic: Topic) => topic.revealed.length >= TILE_COUNT;

  // Timers that haven't been started yet switch to the new length right away;
  // running or paused ones finish with the length they started with.
  function setSessionMinutes(minutes: number) {
    if (!Number.isFinite(minutes)) return;
    const previousMs = sessionMs();
    state.settings.sessionMinutes = Math.round(
      Math.min(MAX_SESSION_MINUTES, Math.max(MIN_SESSION_MINUTES, minutes)),
    );
    for (const topic of state.topics) {
      if (
        topic.timer.endsAt === null &&
        topic.timer.remainingMs === previousMs
      ) {
        topic.timer.remainingMs = sessionMs();
      }
    }
  }

  return {
    topics: computed(() => state.topics),
    selected,
    settings: computed(() => state.settings),
    sessionMs,
    justFinished,
    justLeveledUp,
    select,
    addTopic,
    renameTopic,
    removeTopic,
    start,
    pause,
    reset,
    reveal,
    startNextPicture,
    isComplete,
    setSessionMinutes,
  };
}
