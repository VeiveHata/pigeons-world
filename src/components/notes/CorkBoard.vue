<script setup lang="ts">
import { computed, ref } from "vue";
import { scatterFor, shortDate, tiltFor } from "@/notes/format";
import { useTracker, type Note, type Topic } from "@/tracker/useTracker";
import BinderClip from "./BinderClip.vue";
import NoteDialog from "./NoteDialog.vue";

const props = defineProps<{
  topic: Topic;
}>();

const { addNote, removeNote } = useTracker();

const draft = ref("");
const openNote = ref<Note | null>(null);

// Newest note at the top of the board.
const pinned = computed(() => [...props.topic.notes].reverse());

function remove(note: Note) {
  if (confirm("Delete this note?")) removeNote(props.topic, note.id);
}

function pin() {
  addNote(props.topic, draft.value);
  draft.value = "";
}

// Corner brackets, one per corner of the frame (rotated to fit).
const CORNERS = [
  { place: "left-1.5 top-1.5", turn: 0 },
  { place: "right-1.5 top-1.5", turn: 90 },
  { place: "bottom-1.5 right-1.5", turn: 180 },
  { place: "bottom-1.5 left-1.5", turn: 270 },
];
</script>

<template>
  <!-- A cork board in a dark wooden frame with iron corner brackets -->
  <aside class="frame relative flex p-3.5">
    <svg
      v-for="corner in CORNERS"
      :key="corner.turn"
      viewBox="0 0 28 28"
      class="pointer-events-none absolute z-10 h-7 w-7"
      :class="corner.place"
      :style="{ transform: `rotate(${corner.turn}deg)` }"
      aria-hidden="true"
    >
      <path d="M1 1 H27 V8 H8 V27 H1 Z" class="fill-iron" />
      <circle cx="18" cy="4.5" r="1.4" class="fill-silver-dark" />
      <circle cx="4.5" cy="18" r="1.4" class="fill-silver-dark" />
    </svg>

    <!-- min-w-0: the cork fits inside the frame instead of growing to its content -->
    <div class="cork flex min-w-0 flex-1 flex-col gap-5 p-4 pt-5">
      <form
        class="note relative flex flex-col gap-2 p-2.5 pt-4"
        @submit.prevent="pin"
      >
        <BinderClip class="absolute -top-3 left-1/2 -translate-x-1/2" />
        <textarea
          v-model="draft"
          rows="3"
          placeholder="What did you learn today?"
          aria-label="New note"
          class="w-full min-w-0 resize-y rounded-sm border border-iron/10 bg-transparent px-1.5 py-1 text-navy placeholder:text-navy/50 focus:outline focus:outline-2 focus:outline-slate"
          @keydown.meta.enter.prevent="pin"
          @keydown.ctrl.enter.prevent="pin"
        ></textarea>
        <button
          type="submit"
          class="self-end rounded-sm bg-iron px-3 py-1 text-sm font-bold text-photo-paper hover:bg-frame-wood disabled:opacity-40"
          :disabled="!draft.trim()"
        >
          Pin it
        </button>
      </form>

      <p v-if="!pinned.length" class="text-center text-sm text-iron/80">
        Nothing pinned yet.
      </p>

      <!-- Notes as old photo prints, slightly tilted and scattered -->
      <ul class="grid grid-cols-2 gap-x-3 gap-y-8 pt-1">
        <li
          v-for="note in pinned"
          :key="note.id"
          class="group"
          :style="{
            transform: `translate(${scatterFor(note.id).x}px, ${scatterFor(note.id).y}px) rotate(${tiltFor(note.id)}deg)`,
          }"
        >
          <!-- Clip, paper and folded corner lift together on hover -->
          <div
            class="lift relative h-full transition-transform group-hover:-translate-y-0.5 group-hover:scale-105"
          >
            <div class="print relative h-full">
              <button
                type="button"
                class="flex h-full w-full flex-col gap-1 p-2.5 pt-4 text-left text-navy"
                @click="openNote = note"
              >
                <span
                  class="text-[0.65rem] font-bold uppercase tracking-wider text-iron/70"
                  >{{ shortDate(note.createdAt) }}</span
                >
                <span class="line-clamp-4 break-words text-sm leading-snug">
                  {{ note.text }}
                </span>
              </button>
            </div>
            <!-- Delete: the top-right corner folds down on hover, with an inked × on the flap.
             Outside the paper so the cut corner doesn't make part of it unclickable. -->
            <button
              type="button"
              class="fold absolute right-0 top-0 z-10 h-6 w-6 text-iron/70 hover:text-iron focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate"
              :aria-label="`Delete note from ${shortDate(note.createdAt)}`"
              title="Delete note"
              @click="remove(note)"
            >
              <span
                class="absolute bottom-0.5 left-1 text-xs font-bold leading-none"
                aria-hidden="true"
                >×</span
              >
            </button>
            <!-- Also outside the paper, so folding the corner never clips it -->
            <BinderClip class="absolute -top-3 left-1/2 -translate-x-1/2" />
          </div>
        </li>
      </ul>
    </div>

    <NoteDialog :topic="topic" :note="openNote" @close="openNote = null" />
  </aside>
</template>

<style scoped>
/* Dark stained wood: a few soft light/dark bands plus fine grain lines. */
.frame {
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
  box-shadow: 0 4px 14px rgb(0 0 0 / 0.35);
}

/*
  Light cork set into the frame. The grain is generated noise (an SVG turbulence filter),
  so it looks random like real cork rather than a dot pattern: fine dark specks plus a few
  paler flecks over the theme's light cork colour.
*/
.cork {
  background-color: rgb(var(--color-cork-light));
  background-image:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.36 0 0 0 0 0.24 0 0 0 0 0.12 2.6 0 0 0 -1.25'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.55' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 0.92 0 0 0 0 0.8 0 2.2 0 0 -1.35'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  box-shadow: inset 0 2px 6px rgb(0 0 0 / 0.45);
}

/* Old photo print: off-white paper with a white margin and a soft shadow. */
.note {
  background-color: rgb(var(--color-photo-paper));
  border: 1px solid rgb(0 0 0 / 0.08);
  box-shadow:
    0 1px 2px rgb(0 0 0 / 0.25),
    0 6px 12px -4px rgb(0 0 0 / 0.35);
}

/* A pinned print: shadow drawn around its real shape, so it follows the folded corner. */
.lift {
  filter: drop-shadow(0 1px 1px rgb(0 0 0 / 0.25))
    drop-shadow(0 5px 5px rgb(0 0 0 / 0.28));
}

/* The paper. On hover (or when the delete button has keyboard focus, or always on touch
   screens) the top-right corner is cut away diagonally, as if folded down. */
.print {
  background-color: rgb(var(--color-photo-paper));
  clip-path: polygon(0 0, 100% 0, 100% 0, 100% 100%, 0 100%);
  transition: clip-path 0.15s ease-out;
}

.group:hover .print,
.lift:has(.fold:focus-visible) .print {
  clip-path: polygon(
    0 0,
    calc(100% - 1.5rem) 0,
    100% 1.5rem,
    100% 100%,
    0 100%
  );
}

/* The folded flap: the back of the paper, lying over the corner it came from. */
.fold {
  background: linear-gradient(
    225deg,
    transparent 50%,
    rgb(var(--color-photo-paper-fold)) 50%
  );
  filter: drop-shadow(-1px 1px 1px rgb(0 0 0 / 0.25));
  opacity: 0;
  transition: opacity 0.15s ease-out;
}

.group:hover .fold,
.fold:focus-visible {
  opacity: 1;
}

@media (hover: none) {
  .print {
    clip-path: polygon(
      0 0,
      calc(100% - 1.5rem) 0,
      100% 1.5rem,
      100% 100%,
      0 100%
    );
  }
  .fold {
    opacity: 1;
  }
}
</style>
