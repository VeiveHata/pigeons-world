<script setup lang="ts">
import { computed, ref } from "vue";
import { shortDate, tiltFor } from "@/notes/format";
import { useTracker, type Note, type Topic } from "@/tracker/useTracker";
import NoteDialog from "./NoteDialog.vue";

const props = defineProps<{
  topic: Topic;
}>();

const { addNote } = useTracker();

const draft = ref("");
const openNote = ref<Note | null>(null);

// Newest note at the top of the board.
const pinned = computed(() => [...props.topic.notes].reverse());

function pin() {
  addNote(props.topic, draft.value);
  draft.value = "";
}
</script>

<template>
  <aside class="cork flex flex-col gap-4 p-4 shadow-inner">
    <h2 class="text-xl text-navy">Notes</h2>

    <form
      class="flex flex-col gap-2 rounded bg-green-pale p-2 shadow"
      @submit.prevent="pin"
    >
      <textarea
        v-model="draft"
        rows="3"
        placeholder="What did you learn today?"
        aria-label="New note"
        class="resize-y rounded bg-transparent px-1 text-navy placeholder:text-navy/50 focus:outline focus:outline-2 focus:outline-slate"
        @keydown.meta.enter.prevent="pin"
        @keydown.ctrl.enter.prevent="pin"
      ></textarea>
      <button
        type="submit"
        class="self-end rounded bg-navy px-3 py-1 font-bold text-green-pale hover:bg-slate disabled:opacity-40"
        :disabled="!draft.trim()"
      >
        Pin it
      </button>
    </form>

    <p v-if="!pinned.length" class="text-center text-sm text-navy/80">
      Nothing pinned yet.
    </p>

    <ul class="grid grid-cols-2 gap-3">
      <li
        v-for="note in pinned"
        :key="note.id"
        :style="{ transform: `rotate(${tiltFor(note.id)}deg)` }"
      >
        <button
          type="button"
          class="relative flex h-full w-full flex-col gap-1 bg-green-pale p-3 pt-4 text-left text-navy shadow-md transition-transform hover:scale-105"
          @click="openNote = note"
        >
          <span class="pin" aria-hidden="true"></span>
          <span class="text-xs font-bold">{{ shortDate(note.createdAt) }}</span>
          <span class="line-clamp-4 break-words text-sm leading-snug">
            {{ note.text }}
          </span>
        </button>
      </li>
    </ul>

    <NoteDialog :topic="topic" :note="openNote" @close="openNote = null" />
  </aside>
</template>

<style scoped>
/* Cork texture: a warm base with speckles of lighter and darker cork. */
.cork {
  background-color: rgb(var(--color-cork));
  background-image:
    radial-gradient(
      circle at 20% 30%,
      rgb(var(--color-cork-dark)) 1px,
      transparent 1.5px
    ),
    radial-gradient(
      circle at 70% 60%,
      rgb(var(--color-cork-light)) 1px,
      transparent 1.5px
    ),
    radial-gradient(
      circle at 40% 80%,
      rgb(var(--color-cork-deep)) 1.2px,
      transparent 1.8px
    );
  background-size:
    9px 9px,
    13px 13px,
    17px 17px;
}

.pin {
  position: absolute;
  top: -6px;
  left: 50%;
  width: 14px;
  height: 14px;
  margin-left: -7px;
  border-radius: 9999px;
  background: radial-gradient(
    circle at 35% 35%,
    rgb(var(--color-lilac)),
    rgb(var(--color-slate)) 70%
  );
  box-shadow: 0 2px 2px rgb(0 0 0 / 0.35);
}
</style>
