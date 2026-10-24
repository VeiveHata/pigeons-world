<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { pictureById, tileUrl } from "@/pictures/pictures";
import { useTracker, type Topic } from "@/tracker/useTracker";
import ScratchTile from "./ScratchTile.vue";

const props = defineProps<{
  topic: Topic;
}>();

const { reveal } = useTracker();

const picture = computed(() => pictureById(props.topic.pictureId));

// Id of the tile currently being scratched. Its image is only requested once it's picked.
const scratching = ref<string | null>(null);

// Hidden squares use the page's navy, so the cover blends in with them.
const COVER = "#202734";

watch(
  () => [props.topic.id, props.topic.pictureId],
  () => (scratching.value = null),
);

function pick(tileId: string) {
  if (props.topic.credits > 0) scratching.value = tileId;
}

function onRevealed(tileId: string) {
  reveal(props.topic, tileId);
  scratching.value = null;
}
</script>

<template>
  <!-- Tiles are laid out in grid order: picture.tileIds[index] sits at that position. -->
  <div
    class="grid w-full max-w-2xl gap-0.5"
    :style="{ gridTemplateColumns: `repeat(${picture.cols}, minmax(0, 1fr))` }"
  >
    <div
      v-for="(tileId, index) in picture.tileIds"
      :key="tileId"
      class="aspect-square"
    >
      <img
        v-if="topic.revealed.includes(tileId)"
        :src="tileUrl(picture.id, tileId)"
        alt=""
        class="h-full w-full object-cover"
        draggable="false"
      />
      <ScratchTile
        v-else-if="scratching === tileId"
        :src="tileUrl(picture.id, tileId)"
        :cover="COVER"
        @revealed="onRevealed(tileId)"
      />
      <button
        v-else
        type="button"
        class="h-full w-full bg-navy transition-colors enabled:hover:bg-lilac/40 disabled:cursor-default"
        :disabled="topic.credits < 1"
        :aria-label="`Square ${index + 1}`"
        @click="pick(tileId)"
      />
    </div>
  </div>
</template>
