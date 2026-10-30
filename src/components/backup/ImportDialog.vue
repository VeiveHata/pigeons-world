<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { mergeBackup, type MergeSummary } from "@/backup/backup";
import { useBackup } from "@/backup/useBackup";
import { longDate } from "@/notes/format";
import { useTracker } from "@/tracker/useTracker";

const { topics, replaceWithBackup, mergeWithBackup } = useTracker();
const { pendingImport, protectStorage } = useBackup();

const dialog = ref<HTMLDialogElement>();
// Set once the import has been applied, to show what happened.
const result = ref<
  { mode: "merge"; summary: MergeSummary } | { mode: "replace" } | null
>(null);

const noteCount = computed(
  () =>
    pendingImport.value?.topics.reduce((n, t) => n + t.notes.length, 0) ?? 0,
);

// A dry run, so the preview shows exactly what merging would do.
const mergePreview = computed(() =>
  pendingImport.value
    ? mergeBackup(topics.value, pendingImport.value.topics).summary
    : null,
);

watch(pendingImport, (pending) => {
  if (pending) {
    result.value = null;
    dialog.value?.showModal();
  }
});

function merge() {
  if (!pendingImport.value) return;
  result.value = {
    mode: "merge",
    summary: mergeWithBackup(pendingImport.value),
  };
  void protectStorage();
}

function replace() {
  if (!pendingImport.value) return;
  if (
    !confirm(
      "Replace all progress in this browser with the file? Topics, notes and levels that are only here will be lost.",
    )
  ) {
    return;
  }
  replaceWithBackup(pendingImport.value);
  result.value = { mode: "replace" };
  void protectStorage();
}

function onClose() {
  pendingImport.value = null;
  result.value = null;
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
</script>

<template>
  <dialog
    ref="dialog"
    class="w-[min(34rem,calc(100vw-2rem))] rounded bg-green-pale p-0 text-navy shadow-2xl backdrop:bg-navy/70"
    @close="onClose"
  >
    <article v-if="pendingImport" class="flex flex-col gap-4 p-6">
      <header class="border-b border-navy/20 pb-3">
        <p class="text-sm uppercase tracking-wider opacity-70">
          Progress backup
        </p>
        <h2 class="text-2xl">
          {{
            result
              ? "Done"
              : pendingImport.exportedAt
                ? `From ${longDate(pendingImport.exportedAt)}`
                : "Load progress"
          }}
        </h2>
      </header>

      <!-- Step 1: preview and choice -->
      <template v-if="!result">
        <p>
          The file has {{ plural(pendingImport.topics.length, "topic") }} and
          {{ plural(noteCount, "note") }}.
        </p>

        <section v-if="mergePreview" class="flex flex-col gap-1 text-sm">
          <h3 class="font-bold">If you merge:</h3>
          <ul class="flex flex-col gap-1">
            <li v-for="(m, i) in mergePreview.matched" :key="`m-${i}`">
              <strong>{{ m.title }}</strong> (in both):
              {{
                m.notesAdded
                  ? `+${plural(m.notesAdded, "note")}`
                  : "no new notes"
              }},
              {{
                m.progressFromFile
                  ? "level and squares from the file (further along)"
                  : "keeps this browser's level and squares"
              }}
            </li>
            <li v-for="(title, i) in mergePreview.added" :key="`a-${i}`">
              <strong>{{ title }}</strong
              >: new topic, added with its plant and notes
            </li>
          </ul>
          <p class="mt-1 opacity-70">
            Topics that are only in this browser stay as they are. Nothing is
            deleted.
          </p>
        </section>

        <footer class="flex flex-wrap justify-end gap-3 pt-2">
          <button
            type="button"
            class="rounded border border-navy px-4 py-2 font-bold hover:bg-navy/10"
            @click="dialog?.close()"
          >
            Cancel
          </button>
          <button
            type="button"
            class="rounded border border-navy px-4 py-2 font-bold hover:bg-navy/10"
            @click="replace"
          >
            Replace…
          </button>
          <button
            type="button"
            class="rounded bg-navy px-4 py-2 font-bold text-green-pale hover:bg-slate"
            autofocus
            @click="merge"
          >
            Merge
          </button>
        </footer>
      </template>

      <!-- Step 2: what happened -->
      <template v-else>
        <p v-if="result.mode === 'replace'">
          Your progress was replaced with the file.
        </p>
        <p v-else>
          Merged:
          {{ plural(result.summary.matched.length, "topic") }} combined,
          {{ plural(result.summary.added.length, "topic") }} added,
          {{ plural(result.summary.notesAdded, "new note") }}.
        </p>
        <footer class="flex justify-end pt-2">
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
