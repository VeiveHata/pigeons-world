<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { plantImage, plantName, stageName } from "@/plants/plants";
import { pictureById } from "@/pictures/pictures";
import { isGrown, levelOf, useTracker, type Topic } from "@/tracker/useTracker";
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
    class="flex flex-1 flex-col items-center gap-10 bg-green-dark px-4 py-10 text-green-pale"
  >
    <div class="flex flex-col items-center gap-4">
      <!-- Window -->
      <div
        class="grid h-28 w-44 grid-cols-2 gap-1.5 rounded-t-full border-8 border-navy bg-navy"
        aria-hidden="true"
      >
        <div class="rounded-tl-full bg-green-pale/80"></div>
        <div class="rounded-tr-full bg-green-pale/80"></div>
      </div>
      <h1 class="text-center text-4xl text-green-light sm:text-5xl">
        Your room
      </h1>
    </div>

    <p v-if="!topics.length" class="text-center text-lg">
      No plants yet.
      <RouterLink to="/pigeons" class="underline hover:text-green-light"
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
            class="mt-3 max-w-full truncate px-2 font-bold group-hover:text-green-light"
          >
            {{ topic.title }}
          </span>
        </button>
        <span class="text-center text-sm opacity-80">
          Lv {{ levelOf(topic) }} · {{ stageName(levelOf(topic)) }}
        </span>
        <template v-if="isGrown(topic)">
          <span v-if="topic.garden?.planted" class="text-center text-xs">
            🌼 Planted in your garden
          </span>
          <RouterLink
            v-else-if="topic.garden"
            to="/"
            class="text-center text-xs underline hover:text-green-light"
          >
            🪴 In the garden, still in its pot →
          </RouterLink>
          <RouterLink
            v-else
            to="/"
            class="text-center text-xs underline hover:text-green-light"
          >
            Plant it in your garden →
          </RouterLink>
        </template>
        <div
          class="mx-auto mt-2 h-1.5 w-24 overflow-hidden rounded-full bg-navy"
          role="progressbar"
          :aria-valuenow="topic.revealed.length"
          aria-valuemin="0"
          :aria-valuemax="pictureById(topic.pictureId).tileCount"
          :aria-label="`${topic.title}: progress to the next level`"
        >
          <div
            class="h-full bg-green-light"
            :style="{
              width: `${(topic.revealed.length / pictureById(topic.pictureId).tileCount) * 100}%`,
            }"
          ></div>
        </div>
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
