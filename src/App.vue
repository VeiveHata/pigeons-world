<script setup lang="ts">
import AppHeader from "./components/AppHeader.vue";
import AppFooter from "./components/AppFooter.vue";
import { useFocusMusic } from "./music/useFocusMusic";

// Session music follows the timer on every page, not just the Pigeons page.
useFocusMusic();
</script>

<template>
  <AppHeader />
  <main class="flex flex-1 flex-col">
    <RouterView />
  </main>
  <AppFooter />
</template>
