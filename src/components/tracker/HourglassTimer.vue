<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  // Share of the session still to go: 1 at the start, 0 when it ends.
  remaining: number;
  running: boolean;
}>();

// Glass geometry (viewBox 0 0 200 300): top bulb from y=34 down to the neck at y=150,
// bottom bulb from the neck down to y=268.
const NECK_Y = 150;
const TOP_SAND_MAX = 104; // how high the sand reaches in the top bulb when full
const BOTTOM_Y = 268;
const PILE_MAX = 100; // how high the pile gets in the bottom bulb when the time's up

const share = computed(() => Math.min(1, Math.max(0, props.remaining)));

// Top sand sits on the neck and sinks as time passes.
const topSandY = computed(() => NECK_Y - share.value * TOP_SAND_MAX);
// Bottom pile grows from the floor; its top is a little mound.
const pileY = computed(() => BOTTOM_Y - (1 - share.value) * PILE_MAX);
const pilePath = computed(() => {
  const y = pileY.value;
  return `M30 ${BOTTOM_Y} L30 ${y + 10} Q100 ${y - 12} 170 ${y + 10} L170 ${BOTTOM_Y} Z`;
});

// The stream falls only while sand is moving.
const streaming = computed(() => props.running && share.value > 0);
</script>

<template>
  <svg viewBox="0 0 200 300" class="h-full w-full" aria-hidden="true">
    <defs>
      <clipPath id="hourglass-top">
        <path
          d="M52 34 C52 98 92 122 96 150 L104 150 C108 122 148 98 148 34 Z"
        />
      </clipPath>
      <clipPath id="hourglass-bottom">
        <path
          d="M96 150 C92 178 52 202 52 268 L148 268 C148 202 108 178 104 150 Z"
        />
      </clipPath>
    </defs>

    <!-- Glass: tinted dark so the page behind does not show through it -->
    <path
      d="M52 34 C52 98 92 122 96 150 C92 178 52 202 52 268 L148 268 C148 202 108 178 104 150 C108 122 148 98 148 34 Z"
      class="fill-navy/80 stroke-green-pale/70"
      stroke-width="3"
      stroke-linejoin="round"
    />

    <!-- Sand: what's left on top, the pile below -->
    <rect
      x="40"
      :y="topSandY"
      width="120"
      :height="NECK_Y - topSandY"
      clip-path="url(#hourglass-top)"
      class="fill-cork-light"
    />
    <path
      :d="pilePath"
      clip-path="url(#hourglass-bottom)"
      class="fill-cork-light"
    />

    <!-- Falling stream through the neck -->
    <line
      v-if="streaming"
      x1="100"
      :y1="NECK_Y - 2"
      x2="100"
      :y2="pileY"
      class="stream stroke-cork-light"
      stroke-width="3"
      stroke-linecap="round"
      stroke-dasharray="3 7"
    />

    <!-- Glint on the glass -->
    <path
      d="M64 52 C64 86 80 104 88 118"
      class="stroke-green-mist/50"
      stroke-width="4"
      stroke-linecap="round"
      fill="none"
    />

    <!-- Wooden frame: posts and caps -->
    <path
      d="M34 28 V274 M166 28 V274"
      class="stroke-cork-deep"
      stroke-width="7"
      stroke-linecap="round"
    />
    <rect
      x="18"
      y="12"
      width="164"
      height="22"
      rx="7"
      class="fill-cork stroke-wood"
      stroke-width="2"
    />
    <rect
      x="18"
      y="266"
      width="164"
      height="22"
      rx="7"
      class="fill-cork stroke-wood"
      stroke-width="2"
    />
  </svg>
</template>

<style scoped>
/* Grains slide down the stream; still for people who prefer reduced motion. */
.stream {
  animation: fall 0.6s linear infinite;
}

@keyframes fall {
  to {
    stroke-dashoffset: -10;
  }
}

@media (prefers-reduced-motion: reduce) {
  .stream {
    animation: none;
  }
}
</style>
