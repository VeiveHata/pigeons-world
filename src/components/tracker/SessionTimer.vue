<script setup lang="ts">
import { computed } from "vue";
import { formatClock } from "@/tracker/time";
import {
  remainingMs,
  sessionMs,
  useTracker,
  type Topic,
} from "@/tracker/useTracker";

const props = defineProps<{
  topic: Topic;
}>();

// Opens the focus view (hourglass and music) over the page.
const emit = defineEmits<{
  focus: [];
}>();

const { start, pause, reset } = useTracker();

const remaining = computed(() => remainingMs(props.topic));
const running = computed(() => props.topic.timer.endsAt !== null);
const untouched = computed(
  () => !running.value && remaining.value === sessionMs(props.topic),
);

const display = computed(() => formatClock(remaining.value));

function startAndFocus() {
  start(props.topic);
  emit("focus");
}
</script>

<template>
  <div class="flex flex-col items-center gap-3 sm:items-end">
    <button
      type="button"
      class="rounded px-1 hover:bg-navy/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-lilac"
      title="Open the focus view"
      aria-label="Open the focus view"
      @click="emit('focus')"
    >
      <span
        class="block font-display text-5xl leading-none tabular-nums sm:text-6xl"
        :class="running ? 'text-lilac' : 'text-green-pale'"
        role="timer"
        aria-live="off"
      >
        {{ display }}
      </span>
    </button>
    <div class="flex gap-3">
      <button
        v-if="!running"
        type="button"
        class="rounded bg-lilac px-5 py-2 font-bold text-navy hover:bg-green-pale"
        @click="startAndFocus"
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
