<script setup lang="ts">
import { ref, watch } from "vue";
import { COLS, TILE_COUNT, tileUrl } from "@/tracker/config";
import { useTracker, type Topic } from "@/tracker/useTracker";
import ScratchTile from "./ScratchTile.vue";

const props = defineProps<{
  topic: Topic;
}>();

const { reveal } = useTracker();

// The square currently being scratched. Its tile image is only requested once it's picked.
const scratching = ref<number | null>(null);

// Hidden squares use the page's navy, so the cover blends in with them.
const COVER = "#202734";

watch(
  () => props.topic.id,
  () => (scratching.value = null),
);

function pick(index: number) {
  if (props.topic.credits > 0) scratching.value = index;
}

function onRevealed(index: number) {
  reveal(props.topic, index);
  scratching.value = null;
}
</script>

<template>
  <div
    class="grid w-full max-w-2xl gap-0.5"
    :style="{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }"
  >
    <div v-for="index in TILE_COUNT" :key="index - 1" class="aspect-square">
      <img
        v-if="topic.revealed.includes(index - 1)"
        :src="tileUrl(index - 1)"
        alt=""
        class="h-full w-full object-cover"
        draggable="false"
      />
      <ScratchTile
        v-else-if="scratching === index - 1"
        :src="tileUrl(index - 1)"
        :cover="COVER"
        @revealed="onRevealed(index - 1)"
      />
      <button
        v-else
        type="button"
        class="h-full w-full bg-navy transition-colors enabled:hover:bg-lilac/40 disabled:cursor-default"
        :disabled="topic.credits < 1"
        :aria-label="`Square ${index}`"
        @click="pick(index - 1)"
      />
    </div>
  </div>
</template>
