<script setup lang="ts">
import { computed, watchEffect } from "vue";
import { useRoute } from "vue-router";
import AppHeader from "./components/AppHeader.vue";
import AppFooter from "./components/AppFooter.vue";
import { useFocusMusic } from "./music/useFocusMusic";
import { formatClock } from "./tracker/time";
import { remainingMs, useTracker } from "./tracker/useTracker";

// Session music follows the timer on every page, not just the Pigeons page.
useFocusMusic();

// Each page's background (from its route) runs behind the see-through header too.
const route = useRoute();
const background = computed(() => route.meta.background ?? "bg-navy");

// The tab shows the time left in the running session, so it's visible from other tabs;
// otherwise the page's name. Re-runs every tick, since the countdown changes.
const { topics } = useTracker();
watchEffect(() => {
  const running = topics.value.find((t) => t.timer.endsAt !== null);
  document.title = running
    ? `${formatClock(remainingMs(running))} · ${running.title}`
    : route.meta.title;
});
</script>

<template>
  <div class="flex flex-1 flex-col" :class="background">
    <AppHeader />
    <main class="flex flex-1 flex-col">
      <RouterView />
    </main>
  </div>
  <AppFooter />
</template>
