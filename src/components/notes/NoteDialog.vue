<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { isToday, longDate } from "@/notes/format";
import { useTracker, type Note, type Topic } from "@/tracker/useTracker";

const props = defineProps<{
  topic: Topic;
  // The note to show; null keeps the dialog closed.
  note: Note | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

const { editNote, toggleCrossedOut } = useTracker();
const dialog = ref<HTMLDialogElement>();
const textarea = ref<HTMLTextAreaElement>();

const editing = ref(false);
const draft = ref("");
// Set when a save is refused because the day has ended.
const lockedNow = ref(false);

const editable = computed(
  () => !!props.note && !lockedNow.value && isToday(props.note.createdAt),
);

watch(
  () => props.note,
  (note) => {
    editing.value = false;
    lockedNow.value = false;
    if (note && !dialog.value?.open) dialog.value?.showModal();
    if (!note && dialog.value?.open) dialog.value.close();
  },
);

async function startEdit() {
  if (!props.note) return;
  draft.value = props.note.text;
  editing.value = true;
  await nextTick();
  textarea.value?.focus();
}

function save() {
  if (!props.note || !draft.value.trim()) return;
  // The store re-checks the date, in case midnight passed while editing. Saved: the note
  // closes. Refused: it stays open to show that it's locked now.
  editing.value = false;
  if (editNote(props.topic, props.note.id, draft.value)) dialog.value?.close();
  else lockedNow.value = true;
}

// Escape while editing cancels the edit instead of closing the dialog.
function onCancel(event: Event) {
  if (!editing.value) return;
  event.preventDefault();
  editing.value = false;
}

// Clicking the dimmed backdrop (outside the paper) closes the dialog.
function onClick(event: MouseEvent) {
  if (event.target === dialog.value && !editing.value) dialog.value?.close();
}
</script>

<template>
  <dialog
    ref="dialog"
    class="w-[min(32rem,calc(100vw-2rem))] rounded bg-green-pale p-0 text-navy shadow-2xl backdrop:bg-navy/70"
    @close="emit('close')"
    @cancel="onCancel"
    @click="onClick"
  >
    <article v-if="note" class="flex flex-col gap-4 p-6">
      <header class="flex flex-col gap-1 border-b border-navy/20 pb-3">
        <p class="text-sm uppercase tracking-wider opacity-70">
          {{ topic.title }} · Level {{ note.level }}
          <span v-if="note.editedAt"> · edited</span>
        </p>
        <h2 class="text-2xl">{{ longDate(note.createdAt) }}</h2>
      </header>

      <form v-if="editing" class="flex flex-col gap-3" @submit.prevent="save">
        <textarea
          ref="textarea"
          v-model="draft"
          rows="5"
          aria-label="Edit note"
          class="resize-y rounded border border-navy/30 bg-green-pale p-2 leading-relaxed focus:outline focus:outline-2 focus:outline-slate"
          @keydown.meta.enter.prevent="save"
          @keydown.ctrl.enter.prevent="save"
        ></textarea>
        <div class="flex justify-end gap-3">
          <button
            type="button"
            class="rounded border border-navy px-4 py-2 font-bold hover:bg-navy/10"
            @click="editing = false"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="rounded bg-navy px-4 py-2 font-bold text-green-pale hover:bg-slate disabled:opacity-40"
            :disabled="!draft.trim()"
          >
            Save
          </button>
        </div>
      </form>

      <template v-else>
        <p
          class="whitespace-pre-wrap break-words leading-relaxed"
          :class="note.crossedOut ? 'text-navy/60 line-through' : ''"
        >
          <span v-if="note.crossedOut" class="sr-only">Crossed out: </span
          >{{ note.text }}
        </p>
        <p v-if="!editable" class="text-xs opacity-70">
          🔒 Notes can only be edited on the day they were written.
        </p>
        <footer class="flex justify-end gap-3 pt-2">
          <!-- Allowed on any day, even after the note is locked for editing -->
          <button
            type="button"
            class="rounded border border-navy px-4 py-2 font-bold hover:bg-navy/10"
            :aria-pressed="!!note.crossedOut"
            @click="toggleCrossedOut(topic, note.id)"
          >
            {{ note.crossedOut ? "Uncross" : "Cross out" }}
          </button>
          <button
            v-if="editable"
            type="button"
            class="rounded border border-navy px-4 py-2 font-bold hover:bg-navy/10"
            @click="startEdit"
          >
            Edit
          </button>
          <button
            type="button"
            class="rounded bg-navy px-4 py-2 font-bold text-green-pale hover:bg-slate"
            autofocus
            @click="dialog?.close()"
          >
            Close
          </button>
        </footer>
      </template>
    </article>
  </dialog>
</template>
