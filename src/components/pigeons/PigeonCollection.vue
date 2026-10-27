<script setup lang="ts">
import { computed, ref } from "vue";
import { CARDS, isPortrait, tileUrl } from "@/pictures/pictures";
import { useTracker } from "@/tracker/useTracker";
import PigeonInfo from "./PigeonInfo.vue";

// Every pigeon card, as postcards. Found ones (a picture finished in any topic) show their
// drawing, put together from its tiles, so the whole picture is never served on its own;
// the rest show a blank back. Click a found one to read about it.

const { collectedPictureIds } = useTracker();

const cards = computed(() =>
  CARDS.map((picture) => ({
    picture,
    found: collectedPictureIds.value.has(picture.id),
  })),
);
const foundCount = computed(() => cards.value.filter((c) => c.found).length);

const info = ref<InstanceType<typeof PigeonInfo>>();
</script>

<template>
  <section
    class="flex w-full max-w-6xl flex-col gap-4"
    aria-labelledby="cards-title"
  >
    <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <h2 id="cards-title" class="text-3xl">Pigeon cards</h2>
      <p class="text-sm">
        {{ foundCount }} of {{ CARDS.length }} found. Finish a picture on the
        <RouterLink to="/pigeons" class="underline">Pigeons</RouterLink> page to
        find its card.
      </p>
    </div>

    <ul
      class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
    >
      <li v-for="{ picture, found } in cards" :key="picture.id">
        <button
          v-if="found"
          type="button"
          class="postcard group flex h-full w-full flex-col gap-2 p-2 text-left"
          :aria-label="`${picture.name}: read about this pigeon`"
          @click="info?.open(picture.id)"
        >
          <span class="flex aspect-[4/5] items-center justify-center">
            <span
              class="grid shadow-sm"
              :style="{
                gridTemplateColumns: `repeat(${picture.cols}, minmax(0, 1fr))`,
                aspectRatio: `${picture.cols} / ${picture.rows}`,
                ...(isPortrait(picture)
                  ? { height: '100%' }
                  : { width: '100%' }),
              }"
            >
              <img
                v-for="tileId in picture.tileIds"
                :key="tileId"
                :src="tileUrl(picture.id, tileId)"
                alt=""
                loading="lazy"
                draggable="false"
                class="block aspect-square h-full w-full object-cover"
              />
            </span>
          </span>
          <span class="px-1 pb-1">
            <span
              class="block font-display text-base leading-tight group-hover:underline"
              >{{ picture.name }}</span
            >
            <span class="block text-xs opacity-70">{{
              picture.card?.kind
            }}</span>
          </span>
        </button>

        <div
          v-else
          class="postcard flex h-full w-full flex-col gap-2 p-2"
          aria-label="A pigeon card that hasn't been found yet"
        >
          <span
            class="relative flex aspect-[4/5] items-center justify-center border border-dashed border-navy/25 text-navy/35"
          >
            <span class="font-display text-5xl" aria-hidden="true">?</span>
            <span
              class="absolute right-2 top-2 h-6 w-5 border border-dashed border-navy/30"
              aria-hidden="true"
            ></span>
          </span>
          <span class="px-1 pb-1 text-xs opacity-70">Not found yet</span>
        </div>
      </li>
    </ul>

    <PigeonInfo ref="info" />
  </section>
</template>

<style scoped>
/* Cream card stock with a soft shadow, like the notes on the cork board. */
.postcard {
  background-color: rgb(var(--color-photo-paper));
  box-shadow: 0 2px 8px rgb(0 0 0 / 0.18);
}
</style>
