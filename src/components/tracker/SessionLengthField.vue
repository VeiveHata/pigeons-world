<script setup lang="ts">
import {
  DEV_SESSION_MINUTES,
  MAX_SESSION_MINUTES,
  MIN_SESSION_MINUTES,
} from "@/tracker/config";

const minutes = defineModel<number>({ required: true });
</script>

<template>
  <div class="flex flex-col gap-1">
    <label class="flex items-center justify-between gap-2">
      Session length
      <span class="flex items-center gap-2">
        <input
          v-model.number="minutes"
          type="number"
          :min="MIN_SESSION_MINUTES"
          :max="MAX_SESSION_MINUTES"
          class="w-20 rounded bg-navy px-2 py-1 text-right text-green-pale focus:outline focus:outline-2 focus:outline-lilac"
        />
        min
      </span>
    </label>
    <p class="text-sm opacity-80">
      Between {{ MIN_SESSION_MINUTES }} and {{ MAX_SESSION_MINUTES }} minutes.
      <slot />
    </p>
    <p v-if="DEV_SESSION_MINUTES" class="text-xs text-lilac">
      Dev override from the URL: {{ DEV_SESSION_MINUTES }} min
    </p>
  </div>
</template>
