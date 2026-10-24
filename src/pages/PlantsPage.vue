<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { plantImage, plantName, stageName } from "@/plants/plants";
import { levelOf, useTracker, type Topic } from "@/tracker/useTracker";
import SpecimenCard from "@/components/notes/SpecimenCard.vue";

const router = useRouter();
const { topics, select } = useTracker();

// Plants per shelf: 1 on phones, 2 from `sm`, 4 from `lg` (matches the grid columns below).
// Empty slots finish the last shelf so its plank runs the full width.
const emptySlots = computed(() => {
  const n = topics.value.length;
  const fromSm = (2 - (n % 2)) % 2;
  const fromLg = (4 - (n % 4)) % 4;
  return Array.from({ length: fromLg }, (_, i) =>
    i < fromSm ? "hidden sm:block" : "hidden lg:block",
  );
});

function open(topic: Topic) {
  select(topic.id);
  router.push("/pigeons");
}
</script>

<template>
  <section
    class="room flex flex-1 flex-col items-center gap-10 px-4 py-10 text-green-dark"
  >
    <!-- No visible title; kept for screen readers and the page outline -->
    <h1 class="sr-only">Your plants</h1>

    <p v-if="!topics.length" class="text-center text-lg">
      No plants yet.
      <RouterLink to="/pigeons" class="underline hover:text-slate"
        >Add a topic</RouterLink
      >
      to plant your first seed.
    </p>

    <!-- Planks touch side by side (no column gap), so each row reads as one shelf. -->
    <ul
      v-else
      class="grid w-full max-w-5xl grid-cols-1 gap-y-12 sm:grid-cols-2 lg:grid-cols-4"
    >
      <li
        v-for="(topic, index) in topics"
        :key="topic.id"
        class="flex flex-col"
      >
        <button
          type="button"
          class="group flex flex-col items-center"
          :title="`Study ${topic.title}`"
          @click="open(topic)"
        >
          <img
            :src="plantImage(topic.plantId, levelOf(topic))"
            :alt="`${plantName(topic.plantId)}, ${stageName(levelOf(topic))}`"
            class="h-40 w-auto transition-transform group-hover:-translate-y-1"
          />
          <span class="h-3 w-full bg-navy"></span>
          <span
            class="mt-3 max-w-full truncate px-2 text-lg font-bold group-hover:underline"
          >
            {{ topic.title }}
          </span>
        </button>
        <SpecimenCard :topic="topic" :number="index + 1" class="mt-5" />
      </li>
      <li
        v-for="(visibility, i) in emptySlots"
        :key="`empty-${i}`"
        :class="visibility"
        aria-hidden="true"
      >
        <div class="h-40"></div>
        <div class="h-3 bg-navy"></div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
/*
  Background in echeveria colours: like looking into a rosette, mint and sage glow out
  from the top and fade through blush to peach, the colour of the leaf tips.
  Light enough that the page text is dark green.
*/
.room {
  background-color: rgb(var(--color-succulent-blush));
  background-image:
    radial-gradient(
      70% 45% at 50% 0%,
      rgb(var(--color-succulent-mint)) 0%,
      rgb(var(--color-succulent-sage) / 0.9) 45%,
      transparent 75%
    ),
    radial-gradient(
      60% 40% at 0% 100%,
      rgb(var(--color-succulent-peach) / 0.8),
      transparent 70%
    ),
    radial-gradient(
      55% 35% at 100% 70%,
      rgb(var(--color-succulent-sage) / 0.45),
      transparent 70%
    ),
    linear-gradient(
      180deg,
      rgb(var(--color-succulent-sage)) 0%,
      rgb(var(--color-succulent-blush)) 55%,
      rgb(var(--color-succulent-peach)) 100%
    );
}
</style>
