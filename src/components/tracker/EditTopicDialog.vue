<script setup lang="ts">
import { nextTick, ref } from "vue";
import AppDialog from "@/components/AppDialog.vue";
import { MIN_SESSION_MINUTES, clampMinutes } from "@/tracker/config";
import { useTracker, type Topic } from "@/tracker/useTracker";
import SessionLengthField from "./SessionLengthField.vue";

const { renameTopic, setSessionMinutes } = useTracker();

const dialog = ref<InstanceType<typeof AppDialog>>();
const titleInput = ref<HTMLInputElement>();

let topic: Topic | null = null;
const title = ref("");
const minutes = ref(MIN_SESSION_MINUTES);

// Opens with the topic's current name and session length.
async function open(target: Topic) {
  topic = target;
  title.value = target.title;
  minutes.value = target.sessionMinutes;
  dialog.value?.open();
  await nextTick();
  titleInput.value?.select();
}

function save() {
  if (!topic || !title.value.trim()) return;
  renameTopic(topic.id, title.value);
  // Out-of-range or empty values are clamped to the allowed lengths.
  setSessionMinutes(topic, clampMinutes(Number(minutes.value)));
  dialog.value?.close();
}

defineExpose({ open });
</script>

<template>
  <AppDialog ref="dialog" title="Edit topic">
    <form class="flex flex-col gap-5" @submit.prevent="save">
      <label class="flex flex-col gap-1">
        <span class="text-sm">Name</span>
        <input
          ref="titleInput"
          v-model="title"
          type="text"
          maxlength="200"
          class="rounded bg-navy px-3 py-2 text-green-pale focus:outline focus:outline-2 focus:outline-lilac"
        />
      </label>

      <SessionLengthField v-model="minutes">
        A timer that hasn't started switches right away; a running or paused one
        finishes with its current length.
      </SessionLengthField>

      <div class="flex justify-end gap-3">
        <button
          type="button"
          class="rounded border border-lilac px-4 py-2 font-bold text-lilac hover:bg-navy"
          @click="dialog?.close()"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="rounded bg-lilac px-4 py-2 font-bold text-navy hover:bg-green-pale disabled:opacity-40"
          :disabled="!title.trim()"
        >
          Save
        </button>
      </div>
    </form>
  </AppDialog>
</template>
