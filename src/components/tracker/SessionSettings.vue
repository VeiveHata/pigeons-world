<script setup lang="ts">
import { computed } from "vue";
import {
  DEV_SESSION_MINUTES,
  MAX_SESSION_MINUTES,
  MIN_SESSION_MINUTES,
} from "@/tracker/config";
import { useTracker } from "@/tracker/useTracker";

const { settings, setSessionMinutes } = useTracker();

const minutes = computed({
  get: () => settings.value.sessionMinutes,
  set: (value) => setSessionMinutes(Number(value)),
});
</script>

<template>
  <section class="flex flex-col gap-2 border-t border-navy pt-4">
    <h2 class="text-xl text-lilac">Settings</h2>
    <label class="flex items-center justify-between gap-2">
      Session length
      <span class="flex items-center gap-2">
        <input
          v-model.lazy="minutes"
          type="number"
          :min="MIN_SESSION_MINUTES"
          :max="MAX_SESSION_MINUTES"
          class="w-16 rounded bg-navy px-2 py-1 text-right text-green-pale focus:outline focus:outline-2 focus:outline-lilac"
        />
        min
      </span>
    </label>
    <p v-if="DEV_SESSION_MINUTES" class="text-xs text-lilac">
      Dev override from the URL: {{ DEV_SESSION_MINUTES }} min
    </p>
  </section>
</template>
