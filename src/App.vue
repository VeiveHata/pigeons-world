<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import AppHeader from "./components/AppHeader.vue";
import AppFooter from "./components/AppFooter.vue";
import { useFocusMusic } from "./music/useFocusMusic";

// Session music follows the timer on every page, not just the Pigeons page.
useFocusMusic();

// Each page's background (from its route) runs behind the see-through header too.
const route = useRoute();
const background = computed(() => route.meta.background ?? "bg-navy");
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
