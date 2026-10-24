<script setup lang="ts">
import { computed } from "vue";
import { remainingMs, useTracker, type Topic } from "@/tracker/useTracker";

const props = defineProps<{
  topic: Topic;
}>();

const { start, pause, reset, sessionMs } = useTracker();

const remaining = computed(() => remainingMs(props.topic));
const running = computed(() => props.topic.timer.endsAt !== null);
const untouched = computed(
  () => !running.value && remaining.value === sessionMs(),
);

const display = computed(() => {
  const totalSeconds = Math.ceil(remaining.value / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
});
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <p
      class="font-display text-6xl tabular-nums sm:text-7xl"
      :class="running ? 'text-lilac' : 'text-green-pale'"
      role="timer"
      aria-live="off"
    >
      {{ display }}
    </p>
    <div class="flex gap-3">
      <button
        v-if="!running"
        type="button"
        class="rounded bg-lilac px-5 py-2 font-bold text-navy hover:bg-green-pale"
        @click="start(topic)"
      >
        {{ untouched ? "Start" : "Resume" }}
      </button>
      <button
        v-else
        type="button"
        class="rounded bg-lilac px-5 py-2 font-bold text-navy hover:bg-green-pale"
        @click="pause(topic)"
      >
        Pause
      </button>
      <button
        type="button"
        class="rounded border border-lilac px-5 py-2 font-bold text-lilac hover:bg-navy disabled:opacity-40"
        :disabled="untouched"
        @click="reset(topic)"
      >
        Reset
      </button>
    </div>
  </div>
</template>
