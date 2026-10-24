<script setup lang="ts">
import { onMounted, ref } from "vue";

const props = defineProps<{
  src: string;
  // Cover color; matches the hidden squares around it.
  cover: string;
}>();

const emit = defineEmits<{
  revealed: [];
}>();

// Share of the cover that must be scratched off before the tile counts as revealed.
const REVEAL_AT = 0.6;

const canvas = ref<HTMLCanvasElement>();
let ctx: CanvasRenderingContext2D | null = null;
let scratching = false;
let done = false;

onMounted(() => {
  const el = canvas.value!;
  const dpr = window.devicePixelRatio || 1;
  el.width = el.offsetWidth * dpr;
  el.height = el.offsetHeight * dpr;
  ctx = el.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;
  ctx.fillStyle = props.cover;
  ctx.fillRect(0, 0, el.width, el.height);
  ctx.globalCompositeOperation = "destination-out";
});

function scratchAt(event: PointerEvent) {
  const el = canvas.value;
  if (!ctx || !el || done) return;
  const rect = el.getBoundingClientRect();
  const scale = el.width / rect.width;
  const x = (event.clientX - rect.left) * scale;
  const y = (event.clientY - rect.top) * scale;
  ctx.beginPath();
  ctx.arc(x, y, el.width * 0.18, 0, Math.PI * 2);
  ctx.fill();
}

function scratchedShare() {
  const el = canvas.value!;
  const { data } = ctx!.getImageData(0, 0, el.width, el.height);
  let clear = 0;
  let sampled = 0;
  // Every 8th pixel is plenty to estimate coverage.
  for (let i = 3; i < data.length; i += 32) {
    sampled++;
    if (data[i] === 0) clear++;
  }
  return clear / sampled;
}

function onDown(event: PointerEvent) {
  scratching = true;
  canvas.value?.setPointerCapture(event.pointerId);
  scratchAt(event);
}

function onMove(event: PointerEvent) {
  if (scratching) scratchAt(event);
}

function onUp() {
  scratching = false;
  if (!done && ctx && scratchedShare() >= REVEAL_AT) {
    done = true;
    emit("revealed");
  }
}
</script>

<template>
  <div class="relative h-full w-full">
    <img
      :src="src"
      alt=""
      class="h-full w-full object-cover"
      draggable="false"
    />
    <canvas
      ref="canvas"
      class="absolute inset-0 h-full w-full cursor-crosshair touch-none outline outline-2 outline-lilac"
      aria-label="Scratch this square to reveal it"
      @pointerdown="onDown"
      @pointermove="onMove"
      @pointerup="onUp"
      @pointercancel="onUp"
    />
  </div>
</template>
