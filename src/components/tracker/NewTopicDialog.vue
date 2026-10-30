<script setup lang="ts">
import { nextTick, ref } from "vue";
import AppDialog from "@/components/AppDialog.vue";
import { type PlantId } from "@/plants/plants";
import { DEFAULT_SESSION_MINUTES, clampMinutes } from "@/tracker/config";
import { useTracker } from "@/tracker/useTracker";
import SessionLengthField from "./SessionLengthField.vue";
import PlantPicker from "./PlantPicker.vue";

const { addTopic } = useTracker();

const dialog = ref<InstanceType<typeof AppDialog>>();
const titleInput = ref<HTMLInputElement>();

const title = ref("");
const plant = ref<PlantId>("echeveria");
const minutes = ref(DEFAULT_SESSION_MINUTES);

// Starts fresh every time it opens, with the cursor in the title field.
async function open() {
  title.value = "";
  plant.value = "echeveria";
  minutes.value = DEFAULT_SESSION_MINUTES;
  dialog.value?.open();
  await nextTick();
  titleInput.value?.focus();
}

function create() {
  if (!title.value.trim()) return;
  // Adds the topic and selects it.
  addTopic(title.value, plant.value, clampMinutes(Number(minutes.value)));
  dialog.value?.close();
}

defineExpose({ open });
</script>

<template>
  <AppDialog ref="dialog" title="New topic">
    <form class="flex flex-col gap-5" @submit.prevent="create">
      <label class="flex flex-col gap-1">
        <span class="text-sm">What will you study?</span>
        <input
          ref="titleInput"
          v-model="title"
          type="text"
          maxlength="200"
          placeholder="e.g. Spanish, Piano, Vue"
          class="rounded bg-navy px-3 py-2 text-green-pale placeholder:text-green-pale/50 focus:outline focus:outline-2 focus:outline-lilac"
        />
      </label>

      <SessionLengthField v-model="minutes" />

      <PlantPicker v-model="plant" />

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
          Create
        </button>
      </div>
    </form>
  </AppDialog>
</template>
