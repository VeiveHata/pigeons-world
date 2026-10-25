// Study statistics from the logged sessions (see Topic.sessions), for the Plants room.
import { recordDate } from "@/notes/format";
import type { Topic } from "@/tracker/useTracker";

export type Period = "week" | "month" | "year" | "all";

export const PERIODS: { id: Period; label: string; days?: number }[] = [
  { id: "week", label: "Week", days: 7 },
  { id: "month", label: "Month", days: 30 },
  { id: "year", label: "Year", days: 365 },
  { id: "all", label: "All time" },
];

// One bar of the chart: a day (week, month) or a calendar month (year, all time).
export type Bucket = {
  key: string;
  label: string;
  sessions: number;
  minutes: number;
};

export type TopicStats = {
  topic: Topic;
  sessions: number;
  minutes: number;
};

export type Stats = {
  sessions: number;
  minutes: number;
  // Days with at least one session in the period.
  daysStudied: number;
  // Consecutive days with a session, up to today (or yesterday, so it isn't lost before
  // today's first session). Counted over all sessions, whatever the period.
  streak: number;
  buckets: Bucket[];
  byDay: boolean;
  topics: TopicStats[];
};

const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const monthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const dayLabel = (date: Date) =>
  date.toLocaleDateString(undefined, { day: "numeric", month: "short" });

const monthLabel = (date: Date) =>
  date.toLocaleDateString(undefined, { month: "short", year: "2-digit" });

function streakUntil(days: Set<string>, now: Date) {
  let day = startOfDay(now);
  // Today without a session yet doesn't break the streak.
  if (!days.has(recordDate(day.toISOString()))) {
    day = new Date(day.getTime() - DAY_MS);
  }
  let streak = 0;
  while (days.has(recordDate(day.toISOString()))) {
    streak++;
    day = new Date(day.getFullYear(), day.getMonth(), day.getDate() - 1);
  }
  return streak;
}

export function computeStats(
  topics: Topic[],
  period: Period,
  now = new Date(),
): Stats {
  const all = topics.flatMap((topic) =>
    topic.sessions.map((s) => ({ ...s, topic, at: new Date(s.endedAt) })),
  );
  const days = PERIODS.find((p) => p.id === period)?.days;

  // First day of the period (inclusive); "all time" starts at the first session.
  const today = startOfDay(now);
  const earliest = all.reduce(
    (first, s) => (s.at < first ? s.at : first),
    today,
  );
  const start = days
    ? new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - days + 1,
      )
    : startOfDay(earliest);

  const inPeriod = all.filter((s) => s.at >= start && s.at <= now);

  // Bars: one per day for a week or a month, one per calendar month for longer.
  const byDay = !!days && days <= 31;
  const buckets: Bucket[] = [];
  const bucketOf = new Map<string, Bucket>();
  if (byDay) {
    for (
      let d = new Date(start);
      d <= today;
      d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
    ) {
      const bucket = {
        key: recordDate(d.toISOString()),
        label: dayLabel(d),
        sessions: 0,
        minutes: 0,
      };
      buckets.push(bucket);
      bucketOf.set(bucket.key, bucket);
    }
  } else {
    for (
      let d = new Date(start.getFullYear(), start.getMonth(), 1);
      d <= today;
      d = new Date(d.getFullYear(), d.getMonth() + 1, 1)
    ) {
      const bucket = {
        key: monthKey(d),
        label: monthLabel(d),
        sessions: 0,
        minutes: 0,
      };
      buckets.push(bucket);
      bucketOf.set(bucket.key, bucket);
    }
  }

  const perTopic = new Map<string, TopicStats>();
  const studiedDays = new Set<string>();
  let minutes = 0;
  for (const s of inPeriod) {
    const key = byDay ? recordDate(s.endedAt) : monthKey(s.at);
    const bucket = bucketOf.get(key);
    if (bucket) {
      bucket.sessions++;
      bucket.minutes += s.minutes;
    }
    const entry = perTopic.get(s.topic.id) ?? {
      topic: s.topic,
      sessions: 0,
      minutes: 0,
    };
    entry.sessions++;
    entry.minutes += s.minutes;
    perTopic.set(s.topic.id, entry);
    studiedDays.add(recordDate(s.endedAt));
    minutes += s.minutes;
  }

  return {
    sessions: inPeriod.length,
    minutes,
    daysStudied: studiedDays.size,
    streak: streakUntil(new Set(all.map((s) => recordDate(s.endedAt))), now),
    buckets,
    byDay,
    topics: [...perTopic.values()].sort(
      (a, b) => b.minutes - a.minutes || b.sessions - a.sessions,
    ),
  };
}

// "2 h 15 min", "45 min", "0 min"; short: "2h 15m", "45m".
export function formatDuration(minutes: number, short = false) {
  const total = Math.round(minutes);
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  const [h, m] = short ? ["h", "m"] : [" h", " min"];
  if (!hours) return `${rest}${m}`;
  return rest ? `${hours}${h} ${rest}${m}` : `${hours}${h}`;
}
