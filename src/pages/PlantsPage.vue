<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { plantImage, plantName, stageName } from "@/plants/plants";
import {
  TOPIC_LIMIT,
  levelOf,
  useTracker,
  type Topic,
} from "@/tracker/useTracker";
import SpecimenCard from "@/components/notes/SpecimenCard.vue";
import StatsBoard from "@/components/stats/StatsBoard.vue";

const router = useRouter();
const route = useRoute();

// Coming from a plant's info on the Pigeons page (?plant=<topic id>): scroll to that plant
// and let it glow for a moment so it's easy to find.
const glowing = ref<string | null>(null);
onMounted(async () => {
  const id = route.query.plant;
  if (typeof id !== "string") return;
  await nextTick();
  const plant = document.getElementById(`plant-${id}`);
  if (!plant) return;
  plant.scrollIntoView({ behavior: "smooth", block: "center" });
  glowing.value = id;
  setTimeout(() => (glowing.value = null), 1500);
});
// Shelves hold the topics being studied; fully grown ones are in the archive below.
const {
  topics: allTopics,
  activeTopics: topics,
  archivedTopics,
  select,
} = useTracker();

// Record numbers follow the order topics were added, archived or not.
const recordNumber = (topic: Topic) => allTopics.value.indexOf(topic) + 1;

// Where an archived plant is now: in the garden, or still waiting to be planted.
const gardenStatus = (topic: Topic) =>
  topic.garden?.planted
    ? "Planted in the garden"
    : topic.garden
      ? "In its pot in the garden"
      : "Waiting to be planted";

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
    class="flex flex-1 flex-col items-center gap-10 px-4 pb-10 pt-4 text-plum xl:pt-[6.25rem]"
  >
    <!-- No visible title; kept for screen readers and the page outline -->
    <h1 class="sr-only">Your plants</h1>

    <StatsBoard />

    <p v-if="!topics.length" class="text-center text-lg">
      No plants growing right now.
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
        v-for="topic in topics"
        :id="`plant-${topic.id}`"
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
            :class="{ glow: glowing === topic.id }"
          />
          <span class="h-3 w-full bg-navy"></span>
          <span
            class="mt-3 max-w-full truncate px-2 text-lg font-bold group-hover:underline"
          >
            {{ topic.title }}
          </span>
        </button>
        <SpecimenCard
          :topic="topic"
          :number="recordNumber(topic)"
          class="mt-5"
        />
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

    <!-- Fully grown topics: no longer studied, kept with their notes -->
    <section
      v-if="archivedTopics.length"
      aria-labelledby="archive-title"
      class="flex w-full max-w-5xl flex-col gap-6 border-t-2 border-plum/30 pt-8"
    >
      <div class="flex flex-col gap-1">
        <h2 id="archive-title" class="text-3xl">Archive</h2>
        <p class="text-sm">
          Topics whose plant reached its flowering stage. They no longer count
          towards the {{ TOPIC_LIMIT }} topics you can study at once.
        </p>
      </div>
      <ul
        class="grid w-full grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-4"
      >
        <li
          v-for="topic in archivedTopics"
          :id="`plant-${topic.id}`"
          :key="topic.id"
          class="flex flex-col items-center"
        >
          <img
            :src="plantImage(topic.plantId, levelOf(topic))"
            :alt="`${plantName(topic.plantId)}, ${stageName(levelOf(topic))}`"
            class="h-32 w-auto"
            :class="{ glow: glowing === topic.id }"
          />
          <span class="mt-2 max-w-full truncate px-2 text-lg font-bold">
            {{ topic.title }}
          </span>
          <RouterLink to="/" class="text-sm underline hover:text-slate">{{
            gardenStatus(topic)
          }}</RouterLink>
          <SpecimenCard
            :topic="topic"
            :number="recordNumber(topic)"
            class="mt-4 w-full"
          />
        </li>
      </ul>
    </section>
  </section>
</template>

<style scoped>
/* A halo around the plant (purple, with white inside) that fades out over a second and a
   half. */
.glow {
  animation: glow 1.5s ease-out;
}

@keyframes glow {
  0%,
  40% {
    filter: drop-shadow(0 0 6px rgb(var(--color-white)))
      drop-shadow(0 0 14px rgb(var(--color-pigeon-purple)))
      drop-shadow(0 0 26px rgb(var(--color-pigeon-purple) / 0.8));
  }
  100% {
    filter: drop-shadow(0 0 0 rgb(var(--color-white) / 0))
      drop-shadow(0 0 0 rgb(var(--color-pigeon-purple) / 0))
      drop-shadow(0 0 0 rgb(var(--color-pigeon-purple) / 0));
  }
}
</style>
