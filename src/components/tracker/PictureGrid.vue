<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { isPortrait, pictureById, tileUrl } from "@/pictures/pictures";
import { themeColor } from "@/theme/theme";
import { useTracker, type Topic } from "@/tracker/useTracker";
import ScratchTile from "./ScratchTile.vue";

const props = defineProps<{
  topic: Topic;
}>();

const { reveal } = useTracker();

const picture = computed(() => pictureById(props.topic.pictureId));

// Id of the tile currently being scratched. Its image is only requested once it's picked.
const scratching = ref<string | null>(null);
// Once scratching has started, that square has to be finished before another can be
// picked; until the first stroke you can still change your mind.
const locked = ref(false);

// Hidden squares are half-transparent navy over the page; the scratch cover (drawn on a
// canvas) is solid navy, so the picture piece under it can't be seen before scratching.
const COVER = themeColor("navy");

watch(
  () => [props.topic.id, props.topic.pictureId],
  () => {
    scratching.value = null;
    locked.value = false;
  },
);

function pick(tileId: string) {
  if (props.topic.credits > 0 && !locked.value) scratching.value = tileId;
}

function onRevealed(tileId: string) {
  reveal(props.topic, tileId);
  scratching.value = null;
  locked.value = false;
}
</script>

<template>
  <!-- Tiles are laid out in grid order: picture.tileIds[index] sits at that position.
       No gaps, so revealed pieces join into one picture; hidden squares get an inner line. -->
  <div
    class="grid w-full"
    :class="isPortrait(picture) ? 'max-w-xs sm:max-w-sm' : 'max-w-2xl'"
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
        class="block h-full w-full object-cover"
        draggable="false"
      />
      <ScratchTile
        v-else-if="scratching === tileId"
        :src="tileUrl(picture.id, tileId)"
        :cover="COVER"
        @started="locked = true"
        @revealed="onRevealed(tileId)"
      />
      <button
        v-else
        type="button"
        class="block h-full w-full bg-navy/50 ring-1 ring-inset ring-slate/70 transition-colors enabled:hover:bg-lilac/40 disabled:cursor-default"
        :disabled="topic.credits < 1 || locked"
        :title="
          locked ? 'Finish scratching the square you started first' : undefined
        "
        :aria-label="`Square ${index + 1}`"
        @click="pick(tileId)"
      />
    </div>
  </div>
</template>
