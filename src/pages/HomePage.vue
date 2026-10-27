<script setup lang="ts">
import { computed, ref } from "vue";
import { toSpot, type GardenSpot } from "@/garden/garden";
import { plantGroundImage, plantImage, plantName } from "@/plants/plants";
import { isGrown, levelOf, useTracker, type Topic } from "@/tracker/useTracker";
import PigeonCollection from "@/components/pigeons/PigeonCollection.vue";

const { topics, placeInGarden, plantInGround } = useTracker();

const garden = ref<HTMLElement>();

// Plant width in the garden, as a share of the garden's width.
const PLANT_WIDTH = 0.11;

const inGarden = computed(() => topics.value.filter((t) => t.garden));
const readyToPlant = computed(() =>
  topics.value.filter((t) => isGrown(t) && !t.garden),
);

// Pointer position in % of the garden, not yet limited to the ground.
function pointerInGarden(clientX: number, clientY: number) {
  const rect = garden.value!.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * 100,
    y: ((clientY - rect.top) / rect.height) * 100,
  };
}

function isOverGarden(clientX: number, clientY: number) {
  const rect = garden.value?.getBoundingClientRect();
  return (
    !!rect &&
    clientX >= rect.left &&
    clientX <= rect.right &&
    clientY >= rect.top &&
    clientY <= rect.bottom
  );
}

// Follows the pointer anywhere on the page until it's released. Listening on the window
// (instead of capturing the pointer on the pressed element) behaves the same in every
// browser, with a mouse, a trackpad or a finger.
function followPointer(
  onMove: (event: PointerEvent) => void,
  onEnd: (event: PointerEvent | null) => void,
) {
  const move = (event: PointerEvent) => onMove(event);
  const up = (event: PointerEvent) => {
    stop();
    onEnd(event);
  };
  const cancel = () => {
    stop();
    onEnd(null);
  };
  function stop() {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
    window.removeEventListener("pointercancel", cancel);
  }
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", up);
  window.addEventListener("pointercancel", cancel);
}

// ---------- Dragging a plant from the tray into the garden ----------
// Over the garden, the plant is drawn inside it, in its pot, exactly where it will land
// (its base at the pointer, kept on the grass). Elsewhere, a copy follows the pointer.

const trayDrag = ref<{
  topic: Topic;
  clientX: number;
  clientY: number;
  width: number;
} | null>(null);

const overGarden = computed(
  () =>
    !!trayDrag.value &&
    isOverGarden(trayDrag.value.clientX, trayDrag.value.clientY),
);

// Where the dragged plant would land, or null while it's outside the garden.
const landingSpot = computed(() => {
  if (!trayDrag.value || !overGarden.value) return null;
  const { x, y } = pointerInGarden(
    trayDrag.value.clientX,
    trayDrag.value.clientY,
  );
  return toSpot(x, y);
});

function onTrayDown(topic: Topic, event: PointerEvent) {
  // Stops text selection and the browser's own image dragging.
  event.preventDefault();
  trayDrag.value = {
    topic,
    clientX: event.clientX,
    clientY: event.clientY,
    width: (garden.value?.offsetWidth ?? 600) * PLANT_WIDTH,
  };
  followPointer(
    (e) => {
      if (!trayDrag.value) return;
      trayDrag.value.clientX = e.clientX;
      trayDrag.value.clientY = e.clientY;
    },
    () => {
      const spot = landingSpot.value;
      const dragged = trayDrag.value;
      trayDrag.value = null;
      if (dragged && spot) placeInGarden(dragged.topic, spot.x, spot.y);
    },
  );
}

// Keyboard: puts the plant in the middle of the grass, to be moved with the arrow keys.
function placeWithKeyboard(topic: Topic) {
  placeInGarden(topic, 50, 75);
}

// ---------- Moving a plant that's still in its pot ----------
// `grab` is where the pointer took hold, relative to the spot, so the plant doesn't jump.

const move = ref<{ id: string; spot: GardenSpot; grab: GardenSpot } | null>(
  null,
);

const spotOf = (topic: Topic) =>
  move.value?.id === topic.id ? move.value.spot : topic.garden!;

function onMoveDown(topic: Topic, event: PointerEvent) {
  if (!topic.garden || topic.garden.planted) return;
  event.preventDefault();
  const pointer = pointerInGarden(event.clientX, event.clientY);
  move.value = {
    id: topic.id,
    spot: { x: topic.garden.x, y: topic.garden.y },
    grab: { x: pointer.x - topic.garden.x, y: pointer.y - topic.garden.y },
  };
  followPointer(
    (e) => {
      if (!move.value) return;
      const p = pointerInGarden(e.clientX, e.clientY);
      move.value.spot = toSpot(
        p.x - move.value.grab.x,
        p.y - move.value.grab.y,
      );
    },
    (e) => {
      // Released: save the new spot. Cancelled (e.g. by the system): it stays where it was.
      if (e && move.value)
        placeInGarden(topic, move.value.spot.x, move.value.spot.y);
      move.value = null;
    },
  );
}

// Arrow keys on the move handle nudge the plant (Shift for bigger steps).
function onMoveKey(topic: Topic, event: KeyboardEvent) {
  const step = event.shiftKey ? 5 : 1;
  const moves: Record<string, [number, number]> = {
    ArrowLeft: [-step, 0],
    ArrowRight: [step, 0],
    ArrowUp: [0, -step],
    ArrowDown: [0, step],
  };
  const delta = moves[event.key];
  if (!delta || !topic.garden) return;
  event.preventDefault();
  placeInGarden(topic, topic.garden.x + delta[0], topic.garden.y + delta[1]);
}

// ---------- The shovel ----------

function plant(topic: Topic) {
  if (
    confirm(
      `Plant ${topic.title} here? Once it's in the ground, it stays in this spot.`,
    )
  ) {
    plantInGround(topic);
  }
}
</script>

<template>
  <section class="flex flex-1 flex-col items-center gap-6 px-4 py-10 text-navy">
    <h1 class="text-center text-4xl leading-tight sm:text-6xl">Hello, You!</h1>

    <div class="flex w-full max-w-6xl flex-col gap-4 lg:flex-row">
      <!-- Fixed aspect ratio, so spots saved as percentages look the same on every screen. -->
      <div
        ref="garden"
        class="relative aspect-[16/9] w-full overflow-hidden rounded-lg border-4 shadow-lg transition-colors lg:flex-1"
        :class="overGarden ? 'border-lilac' : 'border-navy'"
        role="group"
        aria-label="Your garden"
      >
        <svg
          class="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 160 90"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0"
                style="stop-color: rgb(var(--color-lilac-mist))"
              />
              <stop
                offset="0.6"
                style="stop-color: rgb(var(--color-pigeon-mist))"
              />
            </linearGradient>
          </defs>
          <rect width="160" height="90" fill="url(#sky)" />
          <circle cx="132" cy="16" r="8" class="fill-paper" />
          <path
            d="M0 44 Q 30 30 62 40 T 120 36 T 160 40 V90 H0 Z"
            class="fill-pigeon-lavender"
          />
          <path
            d="M0 50 Q 40 42 80 48 T 160 46 V90 H0 Z"
            class="fill-green-mid"
          />
          <path
            d="M0 74 Q 80 66 160 76 V90 H0 Z"
            class="fill-green-dark"
            opacity="0.25"
          />
        </svg>

        <div
          v-for="topic in inGarden"
          :key="topic.id"
          class="group absolute"
          :style="{
            width: `${PLANT_WIDTH * 100}%`,
            left: `${spotOf(topic).x}%`,
            top: `${spotOf(topic).y}%`,
            transform: 'translate(-50%, -100%)',
            // Lower plants in front; potted ones above planted ones, so their icons stay reachable.
            zIndex:
              Math.round(spotOf(topic).y * 10) +
              (topic.garden!.planted ? 0 : 10000),
          }"
        >
          <img
            :src="
              topic.garden!.planted
                ? plantGroundImage(topic.plantId)
                : plantImage(topic.plantId, levelOf(topic))
            "
            :alt="`${topic.title}: ${plantName(topic.plantId)}${topic.garden!.planted ? '' : ', in its pot'}`"
            draggable="false"
            class="w-full select-none drop-shadow-md"
            :class="
              topic.garden!.planted
                ? ''
                : move?.id === topic.id
                  ? 'cursor-grabbing touch-none'
                  : 'cursor-grab touch-none'
            "
            @pointerdown="onMoveDown(topic, $event)"
          />
          <span
            class="pointer-events-none absolute left-1/2 top-full mt-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-navy px-2 py-0.5 text-xs text-green-pale group-focus-within:block group-hover:block"
          >
            {{ topic.title }}
          </span>

          <!-- Still in its pot: move handle and shovel. Shown on the side with more room. -->
          <div
            v-if="!topic.garden!.planted"
            class="absolute top-[30%] flex flex-col gap-1"
            :class="spotOf(topic).x > 85 ? 'right-full mr-1' : 'left-full ml-1'"
          >
            <button
              type="button"
              class="grid h-7 w-7 sm:h-9 sm:w-9 touch-none place-items-center rounded-full bg-navy text-green-pale shadow hover:bg-slate focus-visible:outline focus-visible:outline-2 focus-visible:outline-lilac"
              :class="move?.id === topic.id ? 'cursor-grabbing' : 'cursor-grab'"
              :aria-label="`Move ${topic.title}: drag, or use the arrow keys`"
              title="Drag to move"
              @pointerdown="onMoveDown(topic, $event)"
              @keydown="onMoveKey(topic, $event)"
            >
              <svg
                viewBox="0 0 24 24"
                class="h-4 w-4 sm:h-5 sm:w-5"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path
                  d="M12 3v18M3 12h18M12 3 9 6M12 3l3 3M12 21l-3-3M12 21l3-3M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3"
                />
              </svg>
            </button>
            <button
              type="button"
              class="grid h-7 w-7 sm:h-9 sm:w-9 place-items-center rounded-full bg-lilac text-navy shadow hover:bg-lilac-mist focus-visible:outline focus-visible:outline-2 focus-visible:outline-navy"
              :aria-label="`Plant ${topic.title} in the ground here`"
              title="Plant it here"
              @click="plant(topic)"
            >
              <svg
                viewBox="0 0 24 24"
                class="h-4 w-4 sm:h-5 sm:w-5"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <!-- Shovel: T-grip, shaft and a filled spade blade -->
                <path d="M8.5 2.5h7M12 2.5v9" />
                <path
                  d="M7.5 11.5h9v4.5a4.5 4.5 0 0 1-9 0z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- The plant being dragged from the tray, drawn where it will land -->
        <img
          v-if="trayDrag && landingSpot"
          :src="plantImage(trayDrag.topic.plantId, levelOf(trayDrag.topic))"
          alt=""
          class="pointer-events-none absolute opacity-90 drop-shadow-xl"
          :style="{
            width: `${PLANT_WIDTH * 100}%`,
            left: `${landingSpot.x}%`,
            top: `${landingSpot.y}%`,
            transform: 'translate(-50%, -100%)',
            zIndex: 20000,
          }"
        />

        <p
          v-if="!inGarden.length && !trayDrag"
          class="pointer-events-none absolute inset-x-0 top-[62%] px-4 text-center text-sm text-green-pale sm:text-base"
        >
          {{
            readyToPlant.length
              ? "Drag a plant from the right onto the grass."
              : "Your garden is empty for now."
          }}
        </p>
      </div>

      <!-- Tray: fully grown plants that aren't in the garden yet -->
      <aside class="flex flex-col gap-2 lg:w-44">
        <h2 class="text-xl">Ready to plant</h2>
        <template v-if="readyToPlant.length">
          <p class="text-sm">Drag one onto the grass.</p>
          <ul class="flex flex-wrap gap-3 lg:flex-col">
            <li v-for="topic in readyToPlant" :key="topic.id">
              <button
                type="button"
                class="flex w-24 touch-none select-none flex-col items-center rounded bg-lilac/50 p-2 text-center text-xs hover:bg-lilac lg:w-full"
                :class="
                  trayDrag?.topic.id === topic.id
                    ? 'cursor-grabbing opacity-40'
                    : 'cursor-grab'
                "
                :aria-label="`${topic.title}: ${plantName(topic.plantId)}. Drag it onto the grass, or press Enter to place it.`"
                @pointerdown="onTrayDown(topic, $event)"
                @keydown.enter.prevent="placeWithKeyboard(topic)"
                @keydown.space.prevent="placeWithKeyboard(topic)"
              >
                <img
                  :src="plantImage(topic.plantId, levelOf(topic))"
                  alt=""
                  draggable="false"
                  class="h-20"
                />
                <span class="mt-1 w-full truncate font-bold">{{
                  topic.title
                }}</span>
              </button>
            </li>
          </ul>
        </template>
        <p v-else class="text-sm">
          When a plant reaches its flowering stage (level 5), it waits here to
          be planted. Keep studying on the
          <RouterLink to="/pigeons" class="underline">Pigeons</RouterLink>
          page!
        </p>
      </aside>
    </div>

    <PigeonCollection />

    <!-- Outside the garden, a copy of the dragged plant follows the pointer -->
    <img
      v-if="trayDrag && !landingSpot"
      :src="plantImage(trayDrag.topic.plantId, levelOf(trayDrag.topic))"
      alt=""
      class="pointer-events-none fixed z-50 drop-shadow-xl"
      :style="{
        left: `${trayDrag.clientX}px`,
        top: `${trayDrag.clientY}px`,
        width: `${trayDrag.width}px`,
        transform: 'translate(-50%, -100%)',
      }"
    />
  </section>
</template>
