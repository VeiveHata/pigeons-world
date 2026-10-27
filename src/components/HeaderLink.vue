<script setup lang="ts">
defineProps<{
  to: string;
  // Spoken and shown as a tooltip; the sign itself holds an icon.
  label: string;
}>();
</script>

<template>
  <!-- A hanging sign, as big as the logo's, with an icon. The current page is outlined in lilac. -->
  <RouterLink
    :to="to"
    :title="label"
    class="sign sway grid h-[70px] w-[70px] place-items-center [--cord-width:28px] hover:bg-navy"
    active-class="outline outline-2 outline-lilac"
  >
    <span class="sr-only">{{ label }}</span>
    <slot />
  </RouterLink>
</template>
