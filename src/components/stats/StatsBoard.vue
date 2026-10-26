<script setup lang="ts">
import { computed, ref } from "vue";
import { plantImage } from "@/plants/plants";
import {
  PERIODS,
  computeStats,
  formatDuration,
  type Bucket,
  type Period,
} from "@/stats/stats";
import { levelOf, useTracker } from "@/tracker/useTracker";

// The study log: a chalkboard in a wooden frame, with totals for the chosen period
// (last month by default), sessions per day (or month), and time per topic.

const { topics } = useTracker();

const period = ref<Period>("month");
const stats = computed(() => computeStats(topics.value, period.value));

const periodLabel = computed(
  () =>
    ({
      week: "the last 7 days",
      month: "the last 30 days",
      year: "the last 12 months",
      all: "all time",
    })[period.value],
);

const maxSessions = computed(() =>
  Math.max(1, ...stats.value.buckets.map((b) => b.sessions)),
);
const maxTopicMinutes = computed(() =>
  Math.max(1, ...stats.value.topics.map((t) => t.minutes)),
);

// A few x-axis labels, spread out so they never overlap.
const tickIndexes = computed(() => {
  const n = stats.value.buckets.length;
  if (n <= 7) return new Set(Array.from({ length: n }, (_, i) => i));
  return new Set([0, Math.floor((n - 1) / 2), n - 1]);
});

const hovered = ref<number | null>(null);
const hoveredBucket = computed<Bucket | null>(() =>
  hovered.value === null ? null : stats.value.buckets[hovered.value],
);

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
</script>

<template>
  <section
    class="board-frame w-full max-w-5xl p-3.5"
    aria-labelledby="study-log-title"
  >
    <div class="chalkboard flex flex-col gap-6 p-5 text-chalk sm:p-6">
      <!-- Title and period, in one row above everything -->
      <header class="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="study-log-title" class="text-2xl">Study log</h2>
        <div class="flex gap-1" role="group" aria-label="Period">
          <button
            v-for="p in PERIODS"
            :key="p.id"
            type="button"
            class="rounded px-2.5 py-1 text-sm"
            :class="
              period === p.id
                ? 'bg-chalk/15 font-bold text-chalk underline decoration-2 underline-offset-4'
                : 'text-chalk/70 hover:bg-chalk/10 hover:text-chalk'
            "
            :aria-pressed="period === p.id"
            @click="period = p.id"
          >
            {{ p.label }}
          </button>
        </div>
      </header>

      <!-- Totals -->
      <dl class="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <dt class="text-xs uppercase tracking-wider text-chalk/70">
            Sessions
          </dt>
          <dd class="font-display text-3xl sm:text-4xl">
            {{ stats.sessions }}
          </dd>
        </div>
        <div>
          <dt class="text-xs uppercase tracking-wider text-chalk/70">
            Time studied
          </dt>
          <dd class="font-display text-3xl sm:text-4xl">
            {{ formatDuration(stats.minutes, true) }}
          </dd>
        </div>
        <div>
          <dt class="text-xs uppercase tracking-wider text-chalk/70">
            Days studied
          </dt>
          <dd class="font-display text-3xl sm:text-4xl">
            {{ stats.daysStudied }}
          </dd>
        </div>
        <div>
          <dt class="text-xs uppercase tracking-wider text-chalk/70">
            Current streak
          </dt>
          <dd class="font-display text-3xl sm:text-4xl">
            {{ plural(stats.streak, "day") }}
          </dd>
        </div>
      </dl>

      <p v-if="!stats.sessions" class="text-center text-chalk/80">
        No sessions in {{ periodLabel }} yet. Finish a focus session on the
        <RouterLink to="/pigeons" class="underline">Pigeons</RouterLink> page
        and it will show up here.
      </p>

      <template v-else>
        <!-- Sessions per day (or month): one series, so no legend -->
        <figure class="flex flex-col gap-2">
          <figcaption class="text-sm text-chalk/80">
            Sessions per {{ stats.byDay ? "day" : "month" }}, {{ periodLabel }}
          </figcaption>
          <div class="relative">
            <span
              class="absolute -top-1 left-0 text-[0.65rem] text-chalk/60"
              aria-hidden="true"
              >{{ maxSessions }}</span
            >
            <div
              class="flex h-32 items-end gap-0.5 border-b border-chalk/40 pt-3"
              role="img"
              :aria-label="`Bar chart of sessions per ${stats.byDay ? 'day' : 'month'}; the same numbers are in the table below.`"
              @mouseleave="hovered = null"
            >
              <!-- Each column is the hover target; the bar inside is the mark -->
              <div
                v-for="(bucket, i) in stats.buckets"
                :key="bucket.key"
                class="relative flex h-full flex-1 items-end"
                @mouseenter="hovered = i"
              >
                <div
                  v-if="bucket.sessions"
                  class="w-full rounded-t bg-chalk-lilac transition-opacity"
                  :class="hovered !== null && hovered !== i ? 'opacity-60' : ''"
                  :style="{
                    height: `${(bucket.sessions / maxSessions) * 100}%`,
                  }"
                ></div>
              </div>
            </div>

            <!-- Tooltip for the hovered bar -->
            <div
              v-if="hoveredBucket"
              class="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded bg-iron px-2.5 py-1.5 text-xs text-chalk shadow-lg"
              :style="{
                left: `${((hovered! + 0.5) / stats.buckets.length) * 100}%`,
              }"
            >
              <span class="font-bold">{{ hoveredBucket.label }}</span> ·
              {{ plural(hoveredBucket.sessions, "session") }}
              <template v-if="hoveredBucket.minutes">
                · {{ formatDuration(hoveredBucket.minutes) }}</template
              >
            </div>

            <!-- A few axis labels -->
            <div
              class="relative mt-1 h-4 text-[0.65rem] text-chalk/70"
              aria-hidden="true"
            >
              <span
                v-for="(bucket, i) in stats.buckets"
                v-show="tickIndexes.has(i)"
                :key="bucket.key"
                class="absolute -translate-x-1/2 whitespace-nowrap"
                :class="{
                  'translate-x-0': i === 0,
                  '-translate-x-full': i === stats.buckets.length - 1,
                }"
                :style="{
                  left:
                    i === 0
                      ? '0%'
                      : i === stats.buckets.length - 1
                        ? '100%'
                        : `${((i + 0.5) / stats.buckets.length) * 100}%`,
                }"
                >{{ bucket.label }}</span
              >
            </div>
          </div>

          <!-- The chart's numbers, for screen readers -->
          <table class="sr-only">
            <caption>
              Sessions per
              {{
                stats.byDay ? "day" : "month"
              }}
            </caption>
            <thead>
              <tr>
                <th scope="col">{{ stats.byDay ? "Day" : "Month" }}</th>
                <th scope="col">Sessions</th>
                <th scope="col">Time</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="bucket in stats.buckets" :key="bucket.key">
                <td>{{ bucket.label }}</td>
                <td>{{ bucket.sessions }}</td>
                <td>{{ formatDuration(bucket.minutes) }}</td>
              </tr>
            </tbody>
          </table>
        </figure>

        <!-- Time per topic: names and numbers in chalk, the bar just shows the size -->
        <section aria-labelledby="per-topic-title" class="flex flex-col gap-3">
          <h3 id="per-topic-title" class="text-sm text-chalk/80">By topic</h3>
          <ul class="flex flex-col gap-2.5">
            <li
              v-for="entry in stats.topics"
              :key="entry.topic.id"
              class="grid grid-cols-[2rem_minmax(0,1fr)] items-center gap-x-3"
            >
              <img
                :src="plantImage(entry.topic.plantId, levelOf(entry.topic))"
                alt=""
                class="row-span-2 h-10 w-auto self-center justify-self-center"
              />
              <div class="flex items-baseline justify-between gap-3 text-sm">
                <span class="truncate font-bold">{{ entry.topic.title }}</span>
                <span class="shrink-0 text-chalk/80"
                  >{{ plural(entry.sessions, "session") }} ·
                  {{ formatDuration(entry.minutes) }}</span
                >
              </div>
              <div class="h-2 rounded-full bg-chalk/10">
                <div
                  class="h-full rounded-full bg-chalk-lilac"
                  :style="{
                    width: `${(entry.minutes / maxTopicMinutes) * 100}%`,
                  }"
                ></div>
              </div>
            </li>
          </ul>
        </section>
      </template>
    </div>
  </section>
</template>

<style scoped>
/* The same dark stained-wood frame as the notes board. */
.board-frame {
  background-color: rgb(var(--color-frame-wood));
  background-image:
    repeating-linear-gradient(
      0deg,
      rgb(0 0 0 / 0.1) 0 1px,
      transparent 1px 5px
    ),
    linear-gradient(
      90deg,
      rgb(var(--color-frame-wood)),
      rgb(var(--color-frame-wood-light)) 18%,
      rgb(var(--color-frame-wood)) 40%,
      rgb(var(--color-frame-wood-light)) 70%,
      rgb(var(--color-frame-wood))
    );
  box-shadow: 0 6px 18px rgb(0 0 0 / 0.3);
}

/* Slate chalkboard with faint chalk smudges. */
.chalkboard {
  background-color: rgb(var(--color-chalkboard));
  background-image:
    radial-gradient(
      ellipse 40% 30% at 20% 30%,
      rgb(var(--color-chalk) / 0.05),
      transparent 70%
    ),
    radial-gradient(
      ellipse 35% 25% at 80% 70%,
      rgb(var(--color-chalk) / 0.04),
      transparent 70%
    );
  box-shadow: inset 0 2px 8px rgb(0 0 0 / 0.5);
}
</style>
