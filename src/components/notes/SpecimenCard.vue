<script setup lang="ts">
import { ref } from "vue";
import { recordDate } from "@/notes/format";
import { plantLatin, plantName, stageName } from "@/plants/plants";
import { levelOf, type Note, type Topic } from "@/tracker/useTracker";
import NoteDialog from "./NoteDialog.vue";

defineProps<{
  topic: Topic;
  // Record number printed on the card.
  number: number;
}>();

const openNote = ref<Note | null>(null);
</script>

<template>
  <article class="card mx-2 text-left text-navy shadow-lg">
    <header
      class="flex items-baseline justify-between bg-navy px-3 py-1 text-[0.65rem] uppercase tracking-widest text-green-pale"
    >
      <span>Specimen record</span>
      <span>No. {{ String(number).padStart(3, "0") }}</span>
    </header>

    <dl class="grid grid-cols-[auto_1fr] gap-x-2 px-3 pt-2 text-xs">
      <dt class="opacity-70">Subject</dt>
      <dd class="truncate font-bold" :title="topic.title">{{ topic.title }}</dd>
      <dt class="opacity-70">Specimen</dt>
      <dd class="truncate">{{ plantName(topic.plantId) }}</dd>
      <dt class="opacity-70">Species</dt>
      <dd class="truncate italic">{{ plantLatin(topic.plantId) }}</dd>
      <dt class="opacity-70">Stage</dt>
      <dd>{{ stageName(levelOf(topic)) }} · Lv {{ levelOf(topic) }}</dd>
    </dl>

    <h3
      class="mx-3 mt-2 border-b-2 border-navy text-[0.65rem] uppercase tracking-widest"
    >
      Observations
    </h3>

    <ol v-if="topic.notes.length" class="lines max-h-60 overflow-y-auto pb-2">
      <li v-for="note in topic.notes" :key="note.id">
        <button
          type="button"
          class="flex w-full gap-2 px-3 text-left text-xs leading-6 hover:bg-lilac/40"
          @click="openNote = note"
        >
          <span class="shrink-0 font-bold">{{
            recordDate(note.createdAt)
          }}</span>
          <span class="line-clamp-2 break-words">{{ note.text }}</span>
        </button>
      </li>
    </ol>
    <p v-else class="lines px-3 pb-2 text-xs italic leading-6 opacity-70">
      No observations yet.
    </p>

    <NoteDialog :topic="topic" :note="openNote" @close="openNote = null" />
  </article>
</template>

<style scoped>
/* Index-card paper with a red margin line. */
.card {
  background-color: #fbfaf2;
  background-image: linear-gradient(
    to right,
    transparent 0.45rem,
    #e3a3a3 0.45rem,
    #e3a3a3 calc(0.45rem + 1px),
    transparent calc(0.45rem + 1px)
  );
}

/* Ruled lines that match the 1.5rem (leading-6) line height. */
.lines {
  background-image: repeating-linear-gradient(
    to bottom,
    transparent 0,
    transparent calc(1.5rem - 1px),
    #b9cde3 calc(1.5rem - 1px),
    #b9cde3 1.5rem
  );
  background-attachment: local;
}
</style>
