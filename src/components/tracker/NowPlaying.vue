<script setup lang="ts">
import { computed } from "vue";
import { ARTIST, LICENSE } from "@/music/music";
import { useFocusMusic } from "@/music/useFocusMusic";

// Music controls and the credit its CC BY licence asks for. Shown while a session is
// started (running or paused).
// Compact: smaller and left-aligned, for the page under the timer.
defineProps<{
  compact?: boolean;
}>();

const {
  playing,
  volume,
  position,
  duration,
  seek,
  restart,
  track,
  nextTrack,
  previousTrack,
  toggleMusic,
} = useFocusMusic();

// "m:ss" for the track position.
const trackTime = (seconds: number) => {
  const s = Math.floor(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

const seekValue = computed({
  get: () => Math.floor(position.value),
  set: (value: number) => seek(value),
});

const volumePercent = computed({
  get: () => Math.round(volume.value * 100),
  set: (value: number) =>
    (volume.value = Math.min(1, Math.max(0, value / 100))),
});

const iconButton =
  "grid h-8 w-8 shrink-0 place-items-center rounded-full text-lilac hover:bg-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-lilac disabled:opacity-40";
</script>

<template>
  <div
    class="flex flex-col gap-2"
    :class="compact ? 'items-stretch text-xs' : 'items-center text-sm'"
  >
    <div
      class="flex w-full flex-wrap items-center gap-x-2 gap-y-1"
      :class="compact ? 'justify-start' : 'justify-center'"
      role="group"
      aria-label="Music controls"
    >
      <!-- Previous track -->
      <button
        type="button"
        :class="iconButton"
        aria-label="Previous track"
        title="Previous track"
        @click="previousTrack"
      >
        <svg
          viewBox="0 0 24 24"
          class="h-4 w-4"
          fill="currentColor"
          aria-hidden="true"
        >
          <rect x="5" y="5" width="2.5" height="14" rx="1" />
          <path
            d="M19 6.2v11.6a1 1 0 0 1-1.6.8L9.5 12.8a1 1 0 0 1 0-1.6l7.9-5.8a1 1 0 0 1 1.6.8z"
          />
        </svg>
      </button>

      <!-- Play / pause: switches the session music on or off -->
      <button
        type="button"
        :class="iconButton"
        class="border border-lilac"
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

      <!-- Next track -->
      <button
        type="button"
        :class="iconButton"
        aria-label="Next track"
        title="Next track"
        @click="nextTrack"
      >
        <svg
          viewBox="0 0 24 24"
          class="h-4 w-4"
          fill="currentColor"
          aria-hidden="true"
        >
          <rect x="16.5" y="5" width="2.5" height="14" rx="1" />
          <path
            d="M5 6.2v11.6a1 1 0 0 0 1.6.8l7.9-5.8a1 1 0 0 0 0-1.6L6.6 5.4A1 1 0 0 0 5 6.2z"
          />
        </svg>
      </button>

      <!-- Back to the start of the track -->
      <button
        type="button"
        :class="iconButton"
        :disabled="!duration"
        aria-label="Play the track from the start"
        title="From the start"
        @click="restart"
      >
        <svg
          viewBox="0 0 24 24"
          class="h-4 w-4"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
          <path d="M3 3v5h5" />
        </svg>
      </button>

      <!-- Seek bar with position / length -->
      <span class="flex min-w-0 flex-1 items-center gap-2 sm:max-w-xs">
        <input
          v-model.number="seekValue"
          type="range"
          min="0"
          :max="Math.floor(duration) || 0"
          step="1"
          class="h-1 min-w-[5rem] flex-1 cursor-pointer accent-lilac disabled:cursor-default disabled:opacity-40"
          :disabled="!duration"
          aria-label="Position in the track"
          :aria-valuetext="`${trackTime(position)} of ${trackTime(duration)}`"
        />
        <span class="shrink-0 tabular-nums text-green-pale/85">
          {{ trackTime(position) }} /
          {{ duration ? trackTime(duration) : "–:––" }}
        </span>
      </span>

      <!-- Volume -->
      <span class="flex items-center gap-1.5">
        <svg
          viewBox="0 0 24 24"
          class="h-4 w-4 text-green-pale/85"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor" />
          <path v-if="volume > 0" d="M15.5 9.5a4 4 0 0 1 0 5" />
          <path v-if="volume > 0.5" d="M18.5 7a8 8 0 0 1 0 10" />
        </svg>
        <input
          v-model.number="volumePercent"
          type="range"
          min="0"
          max="100"
          step="5"
          class="h-1 w-20 cursor-pointer accent-lilac"
          aria-label="Music volume"
          :aria-valuetext="`${volumePercent}%`"
          :title="`Volume ${volumePercent}%`"
        />
      </span>
    </div>

    <!-- Current track and the credit the CC BY licence asks for -->
    <p
      class="flex flex-wrap items-center gap-x-1.5 gap-y-1"
      :class="
        compact
          ? 'text-green-pale/80'
          : 'justify-center text-center text-green-pale/85'
      "
    >
      <span aria-hidden="true">♪</span>
      <span v-if="playing">Now playing:</span>
      <span class="font-bold">“{{ track.title }}”</span>
      <span>
        by
        <a
          :href="ARTIST.url"
          target="_blank"
          rel="noopener"
          class="underline hover:text-lilac"
          >{{ ARTIST.name }} ({{ ARTIST.site }})</a
        >
        ·
        <a
          :href="LICENSE.url"
          target="_blank"
          rel="noopener"
          class="underline hover:text-lilac"
          >{{ LICENSE.name }}</a
        >
      </span>
    </p>
  </div>
</template>
