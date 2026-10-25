<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useFocusMusic } from "@/music/useFocusMusic";
import { formatClock } from "@/tracker/time";
import { remainingMs, useTracker, type Topic } from "@/tracker/useTracker";
import NowPlaying from "./NowPlaying.vue";

const props = defineProps<{
  topic: Topic;
}>();

const open = defineModel<boolean>("open", { required: true });

const { start, pause, sessionMs, justFinished } = useTracker();
// Music runs with the timer, not with this view (see useFocusMusic).
useFocusMusic();

const dialog = ref<HTMLDialogElement>();

const remaining = computed(() => remainingMs(props.topic));
const running = computed(() => props.topic.timer.endsAt !== null);
const clock = computed(() => formatClock(remaining.value));

watch(open, (value) => {
  if (value && !dialog.value?.open) dialog.value?.showModal();
  if (!value && dialog.value?.open) dialog.value.close();
  lockScroll(value);
});

// The page behind can't scroll while the focus view is open. Where scrollbars take up
// space, their width is kept as padding so the page doesn't shift sideways.
function lockScroll(locked: boolean) {
  const root = document.documentElement;
  if (locked) {
    const scrollbar = window.innerWidth - root.clientWidth;
    root.style.overflow = "hidden";
    root.style.paddingRight = scrollbar > 0 ? `${scrollbar}px` : "";
  } else {
    root.style.overflow = "";
    root.style.paddingRight = "";
  }
}

// E.g. leaving the Pigeons page while the view is open.
onBeforeUnmount(() => lockScroll(false));

// When the session ends, step back to the page, where the new square waits.
watch(justFinished, (id) => {
  if (id === props.topic.id) open.value = false;
});

// Clicking the dimmed page around the panel closes the view; the timer keeps going.
function onClick(event: MouseEvent) {
  if (event.target === dialog.value) open.value = false;
}
</script>

<template>
  <!-- An almost solid veil, so the page's own timer doesn't show behind this one -->
  <dialog
    ref="dialog"
    class="m-auto max-h-full max-w-full bg-transparent p-0 text-green-pale backdrop:bg-navy/95"
    aria-label="Focus session"
    @close="open = false"
    @click="onClick"
  >
    <div
      class="flex flex-col items-center gap-6 rounded-2xl border border-slate bg-navy px-10 py-12 text-center shadow-2xl"
    >
      <p class="text-xs uppercase tracking-[0.3em] text-green-pale/80">Focus</p>
      <h2 class="max-w-md break-words font-display text-3xl text-lilac">
        {{ topic.title }}
      </h2>

      <p
        class="font-display text-8xl leading-none tabular-nums sm:text-9xl"
        :class="running ? 'text-green-pale' : 'text-green-pale/70'"
        role="timer"
        aria-live="off"
      >
        {{ clock }}
      </p>

      <div class="flex flex-wrap items-center justify-center gap-3">
        <button
          v-if="running"
          type="button"
          class="rounded bg-lilac px-5 py-2 font-bold text-navy hover:bg-green-pale"
          @click="pause(topic)"
        >
          Pause
        </button>
        <button
          v-else
          type="button"
          class="rounded bg-lilac px-5 py-2 font-bold text-navy hover:bg-green-pale"
          @click="start(topic)"
        >
          {{ remaining === sessionMs() ? "Start" : "Resume" }}
        </button>
        <button
          type="button"
          class="rounded px-4 py-2 font-bold text-green-pale underline hover:text-lilac"
          @click="open = false"
        >
          Back to the page
        </button>
      </div>

      <NowPlaying class="max-w-md" />
    </div>
  </dialog>
</template>
