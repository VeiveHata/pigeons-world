<script setup lang="ts">
import {
  DEV_SESSION_MINUTES,
  MAX_SESSION_MINUTES,
  MIN_SESSION_MINUTES,
} from "@/tracker/config";
import { useTracker } from "@/tracker/useTracker";

const { settings, setSessionMinutes } = useTracker();

function onChange(event: Event) {
  const input = event.target as HTMLInputElement;
  setSessionMinutes(Number(input.value));
  // Out-of-range values are clamped; show the value that was actually saved,
  // even when it didn't change (e.g. typing 10 while it's already 45).
  input.value = String(settings.value.sessionMinutes);
}
</script>

<template>
  <section class="flex flex-col gap-3">
    <label class="flex items-center justify-between gap-2">
      Session length
      <span class="flex items-center gap-2">
        <input
          :value="settings.sessionMinutes"
          type="number"
          :min="MIN_SESSION_MINUTES"
          :max="MAX_SESSION_MINUTES"
          class="w-16 rounded bg-navy px-2 py-1 text-right text-green-pale focus:outline focus:outline-2 focus:outline-lilac"
          @change="onChange"
        />
        min
      </span>
    </label>
    <p class="text-sm opacity-80">
      Between {{ MIN_SESSION_MINUTES }} and {{ MAX_SESSION_MINUTES }} minutes.
      Timers that haven't started switch right away; a running or paused one
      finishes with its current length.
    </p>
    <p v-if="DEV_SESSION_MINUTES" class="text-xs text-lilac">
      Dev override from the URL: {{ DEV_SESSION_MINUTES }} min
    </p>
  </section>
</template>
