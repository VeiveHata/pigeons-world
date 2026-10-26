import { computed, reactive, ref, watch } from "vue";
import {
  mergeBackup,
  type BackupData,
  type MergeSummary,
} from "@/backup/backup";
import { isToday } from "@/notes/format";
import {
  DEFAULT_PICTURE_ID,
  isPictureId,
  isTileOf,
  nextPictureId,
  pictureById,
  tileIdsFromLegacy,
} from "@/pictures/pictures";
import { readPlace, toSpot, type GardenPlace } from "@/garden/garden";
import { PLANTS, isFullyGrown, type PlantId } from "@/plants/plants";
import {
  DEFAULT_SESSION_MINUTES,
  DEV_SESSION_MINUTES,
  DEV_TEST_PLANT,
  clampMinutes,
} from "./config";

export type Note = {
  id: string;
  text: string;
  // ISO timestamp of when the note was pinned.
  createdAt: string;
  // The topic's level when the note was written.
  level: number;
  // ISO timestamp of the last edit, if any.
  editedAt?: string;
};

// A finished focus session, for the study statistics.
export type Session = {
  // ISO timestamp of when the session ended.
  endedAt: string;
  minutes: number;
};

export type Topic = {
  id: string;
  title: string;
  plantId: PlantId;
  // Oldest first.
  notes: Note[];
  // Full pictures finished; the topic's level is this plus one.
  picturesCompleted: number;
  // The picture being revealed (an id from src/pictures/pictures.json).
  pictureId: string;
  // Ids of the tiles that have been fully scratched off in that picture.
  revealed: string[];
  // Finished sessions not yet spent on a tile.
  credits: number;
  // Where the plant stands in the home page garden, and whether it's planted in the
  // ground yet; null while it waits under "Ready to plant". Only for fully grown plants.
  garden: GardenPlace | null;
  // Finished sessions, oldest first.
  sessions: Session[];
  timer: {
    // Set while running; the timer counts down to this moment.
    endsAt: number | null;
    // Used while paused or idle.
    remainingMs: number;
    // The full length of the current session, set when it starts, so the log records how
    // long it was even if the session length setting changes part-way.
    lengthMs?: number;
  };
};

export type Settings = {
  sessionMinutes: number;
};

// About backups on this device; not part of the backup file itself.
type BackupInfo = {
  lastExportAt: string | null;
};

type State = {
  topics: Topic[];
  selectedId: string | null;
  settings: Settings;
  backup: BackupInfo;
};

const STORAGE_KEY = "pigeons-world.tracker.v1";

// Most topics you can study at once. Archived topics (fully grown plants) don't count.
export const TOPIC_LIMIT = 10;

const DAY_MS = 24 * 60 * 60 * 1000;
// A backup counts as overdue once the last one is this old (or there's never been one).
const BACKUP_OVERDUE_AFTER_MS = 7 * DAY_MS;

const noBackupYet = (): BackupInfo => ({
  lastExportAt: null,
});

function sessionMsFor(settings: Settings) {
  return (DEV_SESSION_MINUTES ?? settings.sessionMinutes) * 60 * 1000;
}

function newTopic(title: string, plantId: PlantId, settings: Settings): Topic {
  return {
    id: crypto.randomUUID(),
    title,
    plantId,
    notes: [],
    picturesCompleted: 0,
    pictureId: DEFAULT_PICTURE_ID,
    revealed: [],
    credits: 0,
    garden: null,
    sessions: [],
    timer: { endsAt: null, remainingMs: sessionMsFor(settings) },
  };
}

// Once its plant reaches the last stage (Flowering), a topic is done: it moves to the
// archive on the Plants page and leaves the Pigeons page's topic list.
const isDone = (topic: Pick<Topic, "picturesCompleted">) =>
  isFullyGrown(topic.picturesCompleted + 1);

// The topic to select when the current one is gone: the first one still being studied.
const firstActiveId = (topics: Topic[]) =>
  topics.find((t) => !isDone(t))?.id ?? null;

type SavedState = Partial<
  Omit<State, "topics"> & {
    // Saves from before plants, levels, notes and pictures lack those fields,
    // and stored revealed squares as grid indexes instead of tile ids.
    topics: (Omit<
      Topic,
      | "plantId"
      | "picturesCompleted"
      | "notes"
      | "pictureId"
      | "revealed"
      | "garden"
      | "sessions"
    > &
      Partial<Omit<Topic, "revealed">> & { revealed: (string | number)[] })[];
  }
>;

// Fills in fields added after a save was written, so older progress keeps working.
function normalize(saved: SavedState): State {
  // Older saves may hold a length that's now out of range (the minimum was raised to 45).
  const savedMinutes =
    saved.settings?.sessionMinutes ?? DEFAULT_SESSION_MINUTES;
  const settings = { sessionMinutes: clampMinutes(savedMinutes) };
  const topics = (saved.topics ?? []).map((topic, i): Topic => {
    const untouched =
      topic.timer.endsAt === null &&
      topic.timer.remainingMs === savedMinutes * 60 * 1000;
    const picture = pictureById(
      isPictureId(topic.pictureId) ? topic.pictureId : DEFAULT_PICTURE_ID,
    );
    return {
      ...topic,
      plantId: topic.plantId ?? PLANTS[i % PLANTS.length].id,
      picturesCompleted: topic.picturesCompleted ?? 0,
      notes: topic.notes ?? [],
      // Saves from before session tracking have no log; their sessions aren't dated.
      sessions: topic.sessions ?? [],
      garden: isFullyGrown((topic.picturesCompleted ?? 0) + 1)
        ? readPlace(topic.garden)
        : null,
      pictureId: picture.id,
      revealed: tileIdsFromLegacy(picture, topic.revealed),
      // Timers that were never started follow the corrected length. Archived topics have
      // no session.
      timer:
        untouched || isFullyGrown((topic.picturesCompleted ?? 0) + 1)
          ? { endsAt: null, remainingMs: sessionMsFor(settings) }
          : topic.timer,
    };
  });
  const selected = topics.find((t) => t.id === saved.selectedId);
  return {
    topics,
    selectedId:
      selected && !isDone(selected) ? selected.id : firstActiveId(topics),
    settings,
    backup: { lastExportAt: saved.backup?.lastExportAt ?? null },
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
  return { topics, selectedId: topics[0].id, settings, backup: noBackupYet() };
}

const state = reactive<State>(load());

// Development only: see DEV_TEST_PLANT.
if (DEV_TEST_PLANT) {
  const TEST_ID = "dev-test-topic";
  let topic = state.topics.find((t) => t.id === TEST_ID);
  if (!topic) {
    topic = newTopic("Test topic", "echeveria", state.settings);
    topic.id = TEST_ID;
    state.topics.push(topic);
  }
  // Fully grown (level 5) and back under "Ready to plant".
  topic.picturesCompleted = Math.max(topic.picturesCompleted, 4);
  topic.garden = null;
}

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
  // Immediate, so a save converted from an older format is written back right away.
  { deep: true, immediate: true },
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
  // Logged with when it really ended, even if the app was closed at that moment.
  topic.sessions.push({
    endedAt: new Date(topic.timer.endsAt ?? Date.now()).toISOString(),
    minutes:
      Math.round(((topic.timer.lengthMs ?? sessionMs()) / 60000) * 10) / 10,
  });
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

// A session that has been started and not finished or reset: running, or paused part-way.
export const isStarted = (topic: Topic) =>
  topic.timer.endsAt !== null || topic.timer.remainingMs < sessionMs();

export const isGrown = (topic: Topic) => isFullyGrown(levelOf(topic));

// Fully grown topics are archived; see isDone.
export const isArchived = isGrown;

const hasProgress = () =>
  state.topics.some(
    (t) => t.notes.length || t.revealed.length || t.picturesCompleted,
  );

const backupOverdue = computed(() => {
  if (!hasProgress()) return false;
  const { lastExportAt } = state.backup;
  return (
    !lastExportAt ||
    now.value - Date.parse(lastExportAt) > BACKUP_OVERDUE_AFTER_MS
  );
});

export function useTracker() {
  const selected = computed(
    () => state.topics.find((t) => t.id === state.selectedId) ?? null,
  );

  function select(id: string) {
    state.selectedId = id;
  }

  const activeTopics = computed(() => state.topics.filter((t) => !isDone(t)));
  const archivedTopics = computed(() => state.topics.filter(isDone));
  const canAddTopic = computed(() => activeTopics.value.length < TOPIC_LIMIT);

  function addTopic(title: string, plantId: PlantId) {
    if (!canAddTopic.value) return;
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
    if (state.selectedId === id) state.selectedId = firstActiveId(state.topics);
  }

  // Only one session runs at a time: starting one pauses any other.
  function start(topic: Topic) {
    for (const other of state.topics) {
      if (other !== topic && other.timer.endsAt !== null) pause(other);
    }
    topic.timer.lengthMs ??= topic.timer.remainingMs;
    topic.timer.endsAt = Date.now() + topic.timer.remainingMs;
    justFinished.value = null;
  }

  function pause(topic: Topic) {
    topic.timer = {
      endsAt: null,
      remainingMs: remainingMs(topic),
      lengthMs: topic.timer.lengthMs,
    };
  }

  function reset(topic: Topic) {
    topic.timer = { endsAt: null, remainingMs: sessionMs() };
  }

  function reveal(topic: Topic, tileId: string) {
    const picture = pictureById(topic.pictureId);
    if (topic.credits < 1 || !isTileOf(picture, tileId)) return;
    if (topic.revealed.includes(tileId)) return;
    topic.revealed.push(tileId);
    topic.credits--;
    if (topic.revealed.length >= picture.tileCount) {
      topic.picturesCompleted++;
      justLeveledUp.value = topic.id;
      // Just archived: a session paused part-way on it is dropped. The page keeps showing
      // it (with a "fully grown" message) until another topic is picked.
      if (isDone(topic)) reset(topic);
    }
  }

  function startNextPicture(topic: Topic) {
    topic.pictureId = nextPictureId(topic.pictureId);
    topic.revealed = [];
    justLeveledUp.value = null;
  }

  const isComplete = (topic: Topic) =>
    topic.revealed.length >= pictureById(topic.pictureId).tileCount;

  function addNote(topic: Topic, text: string) {
    if (!text.trim()) return;
    topic.notes.push({
      id: crypto.randomUUID(),
      text: text.trim(),
      createdAt: new Date().toISOString(),
      level: levelOf(topic),
    });
  }

  // Allowed only on the day the note was written; returns whether it was saved.
  function editNote(topic: Topic, noteId: string, text: string) {
    const note = topic.notes.find((n) => n.id === noteId);
    if (!note || !text.trim() || !isToday(note.createdAt)) return false;
    if (note.text !== text.trim()) {
      note.text = text.trim();
      note.editedAt = new Date().toISOString();
    }
    return true;
  }

  // Puts a fully grown plant, still in its pot, at a spot in the garden, or moves it there.
  // Plants already in the ground stay where they are.
  function placeInGarden(topic: Topic, x: number, y: number) {
    if (!isGrown(topic) || topic.garden?.planted) return;
    topic.garden = { ...toSpot(x, y), planted: false };
  }

  // The shovel: plants it in the ground at its current spot, without the pot.
  function plantInGround(topic: Topic) {
    if (topic.garden) topic.garden.planted = true;
  }

  function removeNote(topic: Topic, noteId: string) {
    topic.notes = topic.notes.filter((n) => n.id !== noteId);
  }

  // Timers that haven't been started yet switch to the new length right away;
  // running or paused ones finish with the length they started with.
  function setSessionMinutes(minutes: number) {
    if (!Number.isFinite(minutes)) return;
    const previousMs = sessionMs();
    state.settings.sessionMinutes = clampMinutes(minutes);
    for (const topic of state.topics) {
      if (
        topic.timer.endsAt === null &&
        topic.timer.remainingMs === previousMs
      ) {
        topic.timer.remainingMs = sessionMs();
      }
    }
  }

  // What goes into a backup file: everything except per-device details.
  function backupData(): BackupData {
    return { topics: state.topics, settings: state.settings };
  }

  function markBackedUp() {
    state.backup.lastExportAt = new Date().toISOString();
  }

  function replaceWithBackup(data: BackupData) {
    state.topics = data.topics;
    state.settings = data.settings;
    state.selectedId = firstActiveId(data.topics);
    justFinished.value = null;
    justLeveledUp.value = null;
  }

  // Keeps this device's settings and running timer; see mergeBackup for the rules.
  function mergeWithBackup(data: BackupData): MergeSummary {
    const { topics, summary } = mergeBackup(state.topics, data.topics);
    state.topics = topics;
    if (!topics.some((t) => t.id === state.selectedId)) {
      state.selectedId = firstActiveId(topics);
    }
    return summary;
  }

  return {
    topics: computed(() => state.topics),
    activeTopics,
    archivedTopics,
    canAddTopic,
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
    addNote,
    editNote,
    removeNote,
    placeInGarden,
    plantInGround,
    setSessionMinutes,
    backupInfo: computed(() => state.backup),
    backupOverdue,
    backupData,
    markBackedUp,
    replaceWithBackup,
    mergeWithBackup,
  };
}
