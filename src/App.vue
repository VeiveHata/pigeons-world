<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import AppHeader from "./components/AppHeader.vue";
import AppFooter from "./components/AppFooter.vue";
import { useFocusMusic } from "./music/useFocusMusic";

// Session music follows the timer on every page, not just the Pigeons page.
useFocusMusic();

// On the Pigeons page the pigeon gradient runs behind the header and the whole page.
const route = useRoute();
const pigeonPage = computed(() => route.path === "/pigeons");
</script>

<template>
  <div class="flex flex-1 flex-col" :class="{ 'bg-pigeon': pigeonPage }">
    <AppHeader :see-through="pigeonPage" />
    <main class="flex flex-1 flex-col">
      <RouterView />
    </main>
  </div>
  <AppFooter />
</template>
