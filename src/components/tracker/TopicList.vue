<script setup lang="ts">
import { nextTick, ref } from "vue";
import { type PlantId } from "@/plants/plants";
import { pictureById } from "@/pictures/pictures";
import { levelOf, useTracker, type Topic } from "@/tracker/useTracker";
import PlantPicker from "./PlantPicker.vue";
import SessionSettings from "./SessionSettings.vue";
import BackupSettings from "@/components/backup/BackupSettings.vue";

const { topics, selected, select, addTopic, renameTopic, removeTopic } =
  useTracker();

const newTitle = ref("");
const newPlant = ref<PlantId>("echeveria");

function submit() {
  if (!newTitle.value.trim()) return;
  addTopic(newTitle.value, newPlant.value);
  newTitle.value = "";
}

function confirmRemove(id: string, title: string) {
  if (confirm(`Delete "${title}" and its plant?`)) removeTopic(id);
}

// Inline renaming: only one topic is edited at a time.
const editingId = ref<string | null>(null);
const editTitle = ref("");
const editInput = ref<HTMLInputElement[]>([]);

async function startEdit(topic: Topic) {
  editingId.value = topic.id;
  editTitle.value = topic.title;
  await nextTick();
  editInput.value[0]?.select();
}

function saveEdit() {
  // Blur also fires after Enter or Escape has already closed the field.
  if (editingId.value === null) return;
  renameTopic(editingId.value, editTitle.value);
  editingId.value = null;
}

function cancelEdit() {
  editingId.value = null;
}
</script>

<template>
  <aside class="flex flex-col gap-4 bg-navy/40 p-4 md:w-72">
    <h2 class="text-xl text-lilac">Topics</h2>

    <ul class="flex flex-col gap-1">
      <li v-for="topic in topics" :key="topic.id" class="group flex">
        <input
          v-if="editingId === topic.id"
          ref="editInput"
          v-model="editTitle"
          type="text"
          :aria-label="`Rename ${topic.title}`"
          class="min-w-0 flex-1 rounded bg-navy px-3 py-2 font-bold text-lilac focus:outline focus:outline-2 focus:outline-lilac"
          @keydown.enter.prevent="saveEdit"
          @keydown.esc.prevent="cancelEdit"
          @blur="saveEdit"
        />
        <template v-else>
          <button
            type="button"
            class="flex min-w-0 flex-1 items-baseline justify-between gap-2 rounded px-3 py-2 text-left"
            :class="
              topic.id === selected?.id
                ? 'bg-navy text-lilac'
                : 'text-green-pale hover:bg-navy/60'
            "
            @click="select(topic.id)"
            @dblclick="startEdit(topic)"
          >
            <span class="truncate font-bold" :title="topic.title">{{
              topic.title
            }}</span>
            <span class="shrink-0 text-sm opacity-70">
              <span v-if="topic.timer.endsAt !== null" title="Session running"
                >⏱
              </span>
              Lv {{ levelOf(topic) }} · {{ topic.revealed.length }}/{{
                pictureById(topic.pictureId).tileCount
              }}
            </span>
          </button>
          <button
            type="button"
            class="px-2 text-green-pale opacity-60 hover:text-lilac focus:opacity-100 group-hover:opacity-100 md:opacity-0"
            :aria-label="`Rename ${topic.title}`"
            title="Rename"
            @click="startEdit(topic)"
          >
            ✎
          </button>
          <button
            type="button"
            class="px-2 text-green-pale opacity-60 hover:text-lilac focus:opacity-100 group-hover:opacity-100 md:opacity-0"
            :aria-label="`Delete ${topic.title}`"
            title="Delete"
            @click="confirmRemove(topic.id, topic.title)"
          >
            ×
          </button>
        </template>
      </li>
    </ul>

    <form class="flex flex-col gap-3" @submit.prevent="submit">
      <div class="flex gap-2">
        <input
          v-model="newTitle"
          type="text"
          placeholder="New topic"
          aria-label="New topic"
          class="min-w-0 flex-1 rounded bg-navy px-3 py-2 text-green-pale placeholder:text-green-pale/50 focus:outline focus:outline-2 focus:outline-lilac"
        />
        <button
          type="submit"
          class="rounded bg-lilac px-3 py-2 font-bold text-navy hover:bg-green-pale"
        >
          Add
        </button>
      </div>
      <PlantPicker v-if="newTitle.trim()" v-model="newPlant" />
    </form>

    <div class="mt-auto flex flex-col gap-4">
      <SessionSettings />
      <BackupSettings />
    </div>
  </aside>
</template>
