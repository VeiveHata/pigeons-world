<script setup lang="ts">
defineProps<{
  to: string;
}>();
</script>

<template>
  <!-- White on every page; the current page is underlined in lilac. -->
  <RouterLink
    :to="to"
    class="text-base font-bold leading-6 text-white decoration-lilac decoration-2 underline-offset-4 hover:underline"
    active-class="underline"
  >
    <slot />
  </RouterLink>
</template>
