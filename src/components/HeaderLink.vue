<script setup lang="ts">
defineProps<{
  to: string;
}>();
</script>

<template>
  <RouterLink :to="to" class="text-base font-bold leading-6">
    <slot />
  </RouterLink>
</template>
