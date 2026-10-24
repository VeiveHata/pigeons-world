<script setup lang="ts">
import AppHeader from "./components/AppHeader.vue";
import AppFooter from "./components/AppFooter.vue";
</script>

<template>
  <AppHeader />
  <main class="flex flex-1 flex-col">
    <RouterView />
  </main>
  <AppFooter />
</template>
