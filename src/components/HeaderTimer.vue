<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useFocusMusic } from "@/music/useFocusMusic";
import { formatClock } from "@/tracker/time";
import { isStarted, remainingMs, useTracker } from "@/tracker/useTracker";

// Shown in the header while a session is started (running or paused), on every page
// except Pigeons, which already shows the timer: just the time left (dimmed while paused)
// and the music controls. The topic and paused state are in the tooltip and for screen
// readers, to keep the header small.

const route = useRoute();
const router = useRouter();
const { topics, selected, select } = useTracker();
const {
  playing,
  volume,
  track,
  liked,
  toggleLike,
  toggleMusic,
  nextTrack,
  previousTrack,
} = useFocusMusic();

// The session to show: the running one (only one runs at a time), otherwise the selected
// topic if it's paused part-way, otherwise any other paused one.
const running = computed(() => {
  if (route.path === "/pigeons") return null;
  return (
    topics.value.find((t) => t.timer.endsAt !== null) ??
    (selected.value && isStarted(selected.value) ? selected.value : null) ??
    topics.value.find(isStarted) ??
    null
  );
});
const paused = computed(() => running.value?.timer.endsAt === null);
const clock = computed(() =>
  running.value ? formatClock(remainingMs(running.value)) : "",
);

function openTopic() {
  if (!running.value) return;
  select(running.value.id);
  void router.push("/pigeons");
}

const volumePercent = computed({
  get: () => Math.round(volume.value * 100),
  set: (value: number) =>
    (volume.value = Math.min(1, Math.max(0, value / 100))),
});
</script>

<template>
  <div
    v-if="running"
    class="flex items-center gap-1 rounded-full bg-slate py-1 pl-1 pr-3 text-sm text-white"
  >
    <button
      type="button"
      class="rounded-full px-2 py-0.5 hover:bg-navy/60"
      :title="`Go to ${running.title}${paused ? ' (paused)' : ''}`"
      @click="openTopic"
    >
      <span class="sr-only"
        >{{ running.title }}{{ paused ? ", paused" : "" }}:
      </span>
      <span
        class="font-display text-base tabular-nums"
        :class="paused ? 'text-white/50' : ''"
        role="timer"
        >{{ clock }}</span
      >
    </button>

    <button
      type="button"
      class="grid h-7 w-7 shrink-0 place-items-center rounded-full text-white hover:bg-navy/60"
      aria-label="Previous track"
      title="Previous track"
      @click="previousTrack"
    >
      <svg
        viewBox="0 0 24 24"
        class="h-3.5 w-3.5"
        fill="currentColor"
        aria-hidden="true"
      >
        <rect x="5" y="5" width="2.5" height="14" rx="1" />
        <path
          d="M19 6.2v11.6a1 1 0 0 1-1.6.8L9.5 12.8a1 1 0 0 1 0-1.6l7.9-5.8a1 1 0 0 1 1.6.8z"
        />
      </svg>
    </button>

    <button
      type="button"
      class="grid h-7 w-7 shrink-0 place-items-center rounded-full hover:bg-navy/60"
      :class="playing ? 'text-lilac' : 'text-white/60'"
      :aria-pressed="playing"
      :aria-label="playing ? 'Pause the music' : 'Play the music'"
      :title="playing ? 'Pause the music' : 'Play the music'"
      @click="toggleMusic"
    >
      <svg
        v-if="playing"
        viewBox="0 0 24 24"
        class="h-4 w-4"
        fill="currentColor"
        aria-hidden="true"
      >
        <rect x="6" y="5" width="4" height="14" rx="1" />
        <rect x="14" y="5" width="4" height="14" rx="1" />
      </svg>
      <svg
        v-else
        viewBox="0 0 24 24"
        class="h-4 w-4"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          d="M8 5.5v13a1 1 0 0 0 1.5.9l10-6.5a1 1 0 0 0 0-1.7l-10-6.5A1 1 0 0 0 8 5.5z"
        />
      </svg>
    </button>

    <button
      type="button"
      class="grid h-7 w-7 shrink-0 place-items-center rounded-full text-white hover:bg-navy/60"
      aria-label="Next track"
      :title="`Next track (now: ${track.title})`"
      @click="nextTrack"
    >
      <svg
        viewBox="0 0 24 24"
        class="h-3.5 w-3.5"
        fill="currentColor"
        aria-hidden="true"
      >
        <rect x="16.5" y="5" width="2.5" height="14" rx="1" />
        <path
          d="M5 6.2v11.6a1 1 0 0 0 1.6.8l7.9-5.8a1 1 0 0 0 0-1.6L6.6 5.4A1 1 0 0 0 5 6.2z"
        />
      </svg>
    </button>

    <button
      type="button"
      class="grid h-7 w-7 shrink-0 place-items-center rounded-full hover:bg-navy/60"
      :class="liked ? 'text-lilac' : 'text-white/60'"
      :aria-pressed="liked"
      :aria-label="
        liked
          ? `Unlike ${track.title}`
          : `Like ${track.title}: play it twice as often`
      "
      :title="
        liked
          ? `${track.title}: liked, plays twice as often`
          : `Like ${track.title}`
      "
      @click="toggleLike"
    >
      <svg
        viewBox="0 0 24 24"
        class="h-3.5 w-3.5"
        :fill="liked ? 'currentColor' : 'none'"
        stroke="currentColor"
        stroke-width="2"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path
          d="M12 20.5s-7.5-4.6-9.2-9.3C1.6 7.7 3.9 4 7.5 4c2 0 3.5 1.1 4.5 2.6C13 5.1 14.5 4 16.5 4c3.6 0 5.9 3.7 4.7 7.2-1.7 4.7-9.2 9.3-9.2 9.3z"
        />
      </svg>
    </button>

    <input
      v-model.number="volumePercent"
      type="range"
      min="0"
      max="100"
      step="5"
      class="h-1 w-16 cursor-pointer accent-lilac sm:w-20"
      aria-label="Music volume"
      :title="`Volume ${volumePercent}%`"
    />
  </div>
</template>
