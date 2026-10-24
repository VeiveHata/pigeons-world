// Progress backup files: building, checking and merging them.
// Imported files are untrusted, so everything is validated and rebuilt field by field.
import { recordDate } from "@/notes/format";
import {
  DEFAULT_PICTURE_ID,
  isPictureId,
  pictureById,
  tileIdsFromLegacy,
} from "@/pictures/pictures";
import { readPlace } from "@/garden/garden";
import { PLANTS, isFullyGrown, type PlantId } from "@/plants/plants";
import {
  DEFAULT_SESSION_MINUTES,
  MAX_SESSION_MINUTES,
  clampMinutes,
} from "@/tracker/config";
import type { Note, Settings, Topic } from "@/tracker/useTracker";

const APP_ID = "pigeons-world";
// 1: revealed squares as grid indexes. 2: picture id plus revealed tile ids.
// Older versions are still accepted and converted on import.
const FORMAT_VERSION = 2;
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_TITLE_LENGTH = 200;
const MAX_NOTE_LENGTH = 20_000;

export type BackupData = {
  topics: Topic[];
  settings: Settings;
};

export type ParsedBackup = BackupData & {
  exportedAt: string | null;
};

type BackupFile = {
  app: typeof APP_ID;
  version: number;
  exportedAt: string;
  data: BackupData;
};

// ---------- Export ----------

export function buildBackupFile(data: BackupData, now = new Date()): string {
  const file: BackupFile = {
    app: APP_ID,
    version: FORMAT_VERSION,
    exportedAt: now.toISOString(),
    data: {
      settings: { ...data.settings },
      // A running timer is saved as paused at its current remaining time.
      topics: data.topics.map((topic) => ({
        ...topic,
        timer: {
          endsAt: null,
          remainingMs:
            topic.timer.endsAt === null
              ? topic.timer.remainingMs
              : Math.max(0, topic.timer.endsAt - now.getTime()),
        },
      })),
    },
  };
  return JSON.stringify(file, null, 2);
}

export const backupFileName = (now = new Date()) =>
  `${APP_ID}-${recordDate(now.toISOString())}.json`;

export function downloadText(text: string, fileName: string) {
  const url = URL.createObjectURL(
    new Blob([text], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

// ---------- Import: validation ----------

export class BackupError extends Error {}

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const isValidDate = (v: unknown): v is string =>
  typeof v === "string" && !Number.isNaN(Date.parse(v));

const wholeNumber = (v: unknown, min: number, fallback: number) =>
  typeof v === "number" && Number.isInteger(v) && v >= min ? v : fallback;

const PLANT_IDS = new Set<string>(PLANTS.map((p) => p.id));

function readNote(raw: unknown): Note | null {
  if (!isObject(raw)) return null;
  if (typeof raw.text !== "string" || !raw.text.trim()) return null;
  if (!isValidDate(raw.createdAt)) return null;
  const note: Note = {
    id: typeof raw.id === "string" && raw.id ? raw.id : crypto.randomUUID(),
    text: raw.text.trim().slice(0, MAX_NOTE_LENGTH),
    createdAt: new Date(raw.createdAt).toISOString(),
    level: wholeNumber(raw.level, 1, 1),
  };
  if (isValidDate(raw.editedAt))
    note.editedAt = new Date(raw.editedAt).toISOString();
  return note;
}

function readTopic(
  raw: unknown,
  index: number,
  settings: Settings,
): Topic | null {
  if (!isObject(raw)) return null;
  if (typeof raw.title !== "string" || !raw.title.trim()) return null;

  const picturesCompleted = wholeNumber(raw.picturesCompleted, 0, 0);

  // Version 1 files have no picture id; they were all made with the default picture.
  const picture = pictureById(
    isPictureId(raw.pictureId) ? raw.pictureId : DEFAULT_PICTURE_ID,
  );
  // Tile ids that belong to the picture; version 1 grid indexes are converted.
  const revealed = tileIdsFromLegacy(
    picture,
    Array.isArray(raw.revealed)
      ? raw.revealed.filter((v) => Number.isInteger(v) || typeof v === "string")
      : [],
  );

  const notes = (Array.isArray(raw.notes) ? raw.notes : [])
    .map(readNote)
    .filter((n): n is Note => n !== null)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const savedMs = isObject(raw.timer) ? raw.timer.remainingMs : undefined;
  const remainingMs =
    typeof savedMs === "number" &&
    savedMs > 0 &&
    savedMs <= MAX_SESSION_MINUTES * 60 * 1000
      ? Math.round(savedMs)
      : settings.sessionMinutes * 60 * 1000;

  return {
    id: typeof raw.id === "string" && raw.id ? raw.id : crypto.randomUUID(),
    title: raw.title.trim().slice(0, MAX_TITLE_LENGTH),
    plantId: PLANT_IDS.has(raw.plantId as string)
      ? (raw.plantId as PlantId)
      : PLANTS[index % PLANTS.length].id,
    notes,
    picturesCompleted,
    pictureId: picture.id,
    revealed,
    credits: wholeNumber(raw.credits, 0, 0),
    // Only fully grown plants can stand in the garden.
    garden: isFullyGrown(picturesCompleted + 1) ? readPlace(raw.garden) : null,
    // Imported timers never start running on their own.
    timer: { endsAt: null, remainingMs },
  };
}

export async function readBackupFile(file: File): Promise<ParsedBackup> {
  if (file.size > MAX_FILE_BYTES) {
    throw new BackupError("This file is too large to be a progress backup.");
  }
  let json: unknown;
  try {
    json = JSON.parse(await file.text());
  } catch {
    throw new BackupError(
      "This file isn't a progress backup (it's not valid JSON).",
    );
  }
  if (!isObject(json) || json.app !== APP_ID || !isObject(json.data)) {
    throw new BackupError("This file isn't a Pigeons World progress backup.");
  }
  if (typeof json.version !== "number" || json.version > FORMAT_VERSION) {
    throw new BackupError(
      "This backup was made by a newer version of the app. Please update the app first.",
    );
  }

  const rawSettings = isObject(json.data.settings) ? json.data.settings : {};
  const settings: Settings = {
    sessionMinutes: clampMinutes(
      typeof rawSettings.sessionMinutes === "number"
        ? rawSettings.sessionMinutes
        : DEFAULT_SESSION_MINUTES,
    ),
  };

  const rawTopics = Array.isArray(json.data.topics) ? json.data.topics : [];
  const topics: Topic[] = [];
  const seenIds = new Set<string>();
  rawTopics.forEach((raw, i) => {
    const topic = readTopic(raw, i, settings);
    if (!topic) return;
    if (seenIds.has(topic.id)) topic.id = crypto.randomUUID();
    seenIds.add(topic.id);
    topics.push(topic);
  });
  if (!topics.length) {
    throw new BackupError("This backup doesn't contain any topics.");
  }

  return {
    topics,
    settings,
    exportedAt: isValidDate(json.exportedAt) ? json.exportedAt : null,
  };
}

// ---------- Import: merging ----------

export type MergeSummary = {
  // Topics found in both, with what the merge does to each.
  matched: {
    title: string;
    notesAdded: number;
    progressFromFile: boolean;
  }[];
  // Topics only in the file; they're added as they are.
  added: string[];
  notesAdded: number;
};

const sameTitle = (a: string, b: string) =>
  a.trim().toLocaleLowerCase() === b.trim().toLocaleLowerCase();

// Whether a has got further than b: level first, then squares in the current picture.
const isFurther = (a: Topic, b: Topic) =>
  a.picturesCompleted !== b.picturesCompleted
    ? a.picturesCompleted > b.picturesCompleted
    : a.revealed.length > b.revealed.length;

const lastChange = (n: Note) => n.editedAt ?? n.createdAt;

function mergeNotes(current: Note[], incoming: Note[]) {
  const byId = new Map(current.map((n) => [n.id, n]));
  let added = 0;
  for (const note of incoming) {
    const existing = byId.get(note.id);
    if (!existing) added++;
    // The same note on both sides: keep the most recently edited version.
    if (!existing || lastChange(note) > lastChange(existing))
      byId.set(note.id, note);
  }
  const notes = [...byId.values()].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );
  return { notes, added };
}

// Combines the file into the current progress without losing anything from either side.
// Topics are matched by id (kept across export/import), or else by name.
// Notes are combined. Levels and squares can't be added up, because both sides
// may contain the same sessions, so the topic that got further is kept.
export function mergeBackup(
  current: Topic[],
  incoming: Topic[],
): { topics: Topic[]; summary: MergeSummary } {
  const topics = current.map((t) => ({ ...t }));
  const summary: MergeSummary = { matched: [], added: [], notesAdded: 0 };
  const used = new Set<string>();

  for (const theirs of incoming) {
    const ours =
      topics.find((t) => t.id === theirs.id && !used.has(t.id)) ??
      topics.find((t) => !used.has(t.id) && sameTitle(t.title, theirs.title));

    if (!ours) {
      // Avoid an id clash with a topic that was already matched by name.
      const id = topics.some((t) => t.id === theirs.id)
        ? crypto.randomUUID()
        : theirs.id;
      topics.push({ ...theirs, id });
      used.add(id);
      summary.added.push(theirs.title);
      summary.notesAdded += theirs.notes.length;
      continue;
    }

    used.add(ours.id);
    const { notes, added } = mergeNotes(ours.notes, theirs.notes);
    const progressFromFile = isFurther(theirs, ours);
    ours.notes = notes;
    if (progressFromFile) {
      ours.picturesCompleted = theirs.picturesCompleted;
      ours.pictureId = theirs.pictureId;
      ours.revealed = [...theirs.revealed];
    }
    ours.credits = Math.max(ours.credits, theirs.credits);
    // A plant keeps its place in this browser's garden; if it's only in the file's garden, use that.
    if (!ours.garden && theirs.garden) ours.garden = { ...theirs.garden };
    summary.matched.push({
      title: ours.title,
      notesAdded: added,
      progressFromFile,
    });
    summary.notesAdded += added;
  }

  return { topics, summary };
}
