<script setup lang="ts">
import { ref } from "vue";
import { timeAgo, useBackup } from "@/backup/useBackup";
import { useTracker } from "@/tracker/useTracker";
import ImportDialog from "./ImportDialog.vue";

const { backupInfo, backupOverdue } = useTracker();
const { persisted, importError, protectStorage, download, chooseFile } =
  useBackup();

const fileInput = ref<HTMLInputElement>();

function onFile(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  // Clear it so choosing the same file again still triggers a change.
  input.value = "";
  if (file) void chooseFile(file);
}
</script>

<template>
  <section class="flex flex-col gap-3">
    <p class="text-sm">
      Your progress lives only in this browser. Last backup:
      <strong :class="{ 'text-lilac': backupOverdue }"
        >{{ backupOverdue ? "⚠ " : ""
        }}{{ timeAgo(backupInfo.lastExportAt) }}</strong
      >
    </p>

    <div class="flex flex-wrap gap-2">
      <button
        type="button"
        class="rounded bg-lilac px-3 py-1.5 text-sm font-bold text-navy hover:bg-green-pale"
        @click="download"
      >
        Download
      </button>
      <button
        type="button"
        class="rounded border border-lilac px-3 py-1.5 text-sm font-bold text-lilac hover:bg-navy"
        @click="fileInput?.click()"
      >
        Load from file…
      </button>
      <input
        ref="fileInput"
        type="file"
        accept="application/json,.json"
        class="hidden"
        @change="onFile"
      />
    </div>

    <p v-if="importError" role="alert" class="text-sm text-lilac">
      {{ importError }}
    </p>

    <p v-if="persisted === false" class="text-xs opacity-80">
      The browser may clear this data on its own.
      <button
        type="button"
        class="underline hover:text-lilac"
        @click="protectStorage"
      >
        Ask it to keep it
      </button>
    </p>
    <p v-else-if="persisted" class="text-xs opacity-80">
      ✓ The browser won't clear this data on its own.
    </p>

    <ImportDialog />
  </section>
</template>
