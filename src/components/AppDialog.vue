<script setup lang="ts">
import { ref } from "vue";

defineProps<{
  title: string;
}>();

const dialog = ref<HTMLDialogElement>();

defineExpose({
  open: () => dialog.value?.showModal(),
  close: () => dialog.value?.close(),
});

// Clicking the dimmed backdrop (outside the panel) closes the dialog.
function onClick(event: MouseEvent) {
  if (event.target === dialog.value) dialog.value?.close();
}
</script>

<template>
  <dialog
    ref="dialog"
    class="w-[min(26rem,calc(100vw-2rem))] rounded-lg bg-slate p-0 text-green-pale shadow-2xl backdrop:bg-navy/70"
    @click="onClick"
  >
    <div class="flex flex-col gap-4 p-5">
      <header class="flex items-center justify-between gap-4">
        <h2 class="text-2xl text-lilac">{{ title }}</h2>
        <button
          type="button"
          class="grid h-8 w-8 place-items-center rounded-full text-xl hover:bg-navy"
          aria-label="Close"
          @click="dialog?.close()"
        >
          ×
        </button>
      </header>
      <slot />
    </div>
  </dialog>
</template>
