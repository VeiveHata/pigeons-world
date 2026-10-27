<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  STAGES,
  plantImage,
  plantLatin,
  plantName,
  stageName,
} from "@/plants/plants";
import { pictureById } from "@/pictures/pictures";
import {
  isArchived,
  isStarted,
  levelOf,
  useTracker,
} from "@/tracker/useTracker";
import AppDialog from "@/components/AppDialog.vue";
import TopicList from "@/components/tracker/TopicList.vue";
import SessionTimer from "@/components/tracker/SessionTimer.vue";
import FocusView from "@/components/tracker/FocusView.vue";
import NowPlaying from "@/components/tracker/NowPlaying.vue";
import PictureGrid from "@/components/tracker/PictureGrid.vue";
import CorkBoard from "@/components/notes/CorkBoard.vue";
import PigeonInfo from "@/components/pigeons/PigeonInfo.vue";

const {
  topics,
  selected,
  justFinished,
  justLeveledUp,
  isComplete,
  startNextPicture,
} = useTracker();

// Music controls show here while a session is started (running or paused).
const anyStarted = computed(() => topics.value.some(isStarted));

// The plant info: its name and current size, opened from the line under the title.
const plantDialog = ref<InstanceType<typeof AppDialog>>();

// What's known about the pigeon of a finished picture. It opens by itself when the last
// square is opened, and again from the buttons below.
const pigeonInfo = ref<InstanceType<typeof PigeonInfo>>();
// The old photo (before pigeon cards) has nothing to tell.
const hasCard = (pictureId: string) => !!pictureById(pictureId).card;
watch(justLeveledUp, (id) => {
  if (id && id === selected.value?.id && hasCard(selected.value.pictureId)) {
    pigeonInfo.value?.open(selected.value.pictureId);
  }
});

// The focus view: hourglass and music over the page, opened from the timer.
const focusOpen = ref(false);

// Whether the topics drawer is collapsed; remembered in this browser only.
const SIDEBAR_KEY = "pigeons-world.sidebar-collapsed";
const collapsed = ref(readCollapsed());

function readCollapsed() {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === "1";
  } catch {
    return false;
  }
}

watch(collapsed, (value) => {
  try {
    localStorage.setItem(SIDEBAR_KEY, value ? "1" : "0");
  } catch {
    // Just won't be remembered.
  }
});
</script>

<template>
  <!-- Three columns on large screens; below that, the notes board moves under the picture. -->
  <section
    class="grid flex-1 grid-cols-1 text-green-pale transition-[grid-template-columns] duration-300 md:grid-rows-[auto_1fr] lg:grid-rows-1"
    :class="
      collapsed
        ? 'md:grid-cols-[4.5rem_minmax(0,1fr)] lg:grid-cols-[4.5rem_minmax(0,1fr)_22rem] xl:grid-cols-[4.5rem_minmax(0,1fr)_26rem]'
        : 'md:grid-cols-[18rem_minmax(0,1fr)] lg:grid-cols-[18rem_minmax(0,1fr)_22rem] xl:grid-cols-[18rem_minmax(0,1fr)_26rem]'
    "
  >
    <TopicList
      class="md:row-span-2 lg:row-span-1"
      :collapsed="collapsed"
      @toggle="collapsed = !collapsed"
    />

    <div class="flex flex-col items-center gap-8 px-4 py-10">
      <!-- Just grew to flowering: archived, shown until another topic is picked -->
      <div
        v-if="selected && isArchived(selected)"
        class="mt-16 flex max-w-lg flex-col items-center gap-4 text-center"
        aria-live="polite"
      >
        <h1 class="text-4xl leading-tight text-lilac sm:text-5xl">
          {{ selected.title }}
        </h1>
        <p class="text-lg">
          <strong class="text-lilac">Fully grown!</strong> Your
          {{ plantName(selected.plantId).toLowerCase() }} is flowering, so this
          topic has moved to the
          <RouterLink
            :to="{ path: '/plants', query: { plant: selected.id } }"
            class="underline hover:text-lilac"
            >archive in the Plants room</RouterLink
          >. It's also waiting in the
          <RouterLink to="/" class="underline hover:text-lilac"
            >garden</RouterLink
          >
          to be planted.
        </p>
        <p v-if="hasCard(selected.pictureId)">
          <button
            type="button"
            class="underline hover:text-lilac"
            @click="pigeonInfo?.open(selected.pictureId)"
          >
            About the last pigeon you found
          </button>
        </p>
        <p>Pick another topic on the left, or add a new one.</p>
      </div>

      <template v-else-if="selected">
        <!-- Topic info on the left, timer on the right; stacked on narrow screens -->
        <div
          class="flex w-full max-w-2xl flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="flex min-w-0 flex-col items-center gap-2 sm:items-start">
            <h1
              class="break-words text-center text-4xl leading-tight text-lilac sm:text-left sm:text-5xl"
            >
              {{ selected.title }}
            </h1>
            <div class="flex items-center gap-1">
              <button
                type="button"
                class="rounded px-1 hover:bg-navy/60 sm:-ml-1"
                title="About this plant"
                @click="plantDialog?.open()"
              >
                Level {{ levelOf(selected) }} ·
                {{ plantName(selected.plantId) }} ({{
                  stageName(levelOf(selected))
                }})
              </button>

              <!-- Progress to the next level, shown on hover, focus or tap -->
              <span class="group relative">
                <button
                  type="button"
                  class="grid h-6 w-6 place-items-center rounded-full border border-green-pale/60 text-xs font-bold italic text-green-pale hover:border-lilac hover:text-lilac focus-visible:outline focus-visible:outline-2 focus-visible:outline-lilac"
                  aria-label="Progress to the next level"
                  :aria-describedby="`progress-${selected.id}`"
                >
                  i
                </button>
                <span
                  :id="`progress-${selected.id}`"
                  role="tooltip"
                  class="absolute left-1/2 top-full z-30 mt-2 hidden w-60 -translate-x-1/2 rounded bg-navy px-3 py-2 text-center text-sm shadow-lg group-focus-within:block group-hover:block"
                >
                  Finish a session to open a square ·
                  {{
                    pictureById(selected.pictureId).tileCount -
                    selected.revealed.length
                  }}
                  to the next level
                </span>
              </span>
            </div>
          </div>

          <SessionTimer
            :topic="selected"
            class="shrink-0"
            @focus="focusOpen = true"
          />
          <FocusView v-model:open="focusOpen" :topic="selected" />
        </div>

        <NowPlaying v-if="anyStarted" compact class="w-full max-w-2xl" />

        <!-- Only when there's something to do: open a square, or start the next picture -->
        <p
          v-if="isComplete(selected) || selected.credits > 0"
          class="text-center"
          aria-live="polite"
        >
          <template v-if="isComplete(selected)">
            <strong class="text-lilac">
              {{
                justLeveledUp === selected.id ? "Level up! " : "Picture done! "
              }}
            </strong>
            Your {{ plantName(selected.plantId).toLowerCase() }} is now
            {{ stageName(levelOf(selected)).toLowerCase() }}.
            <button
              type="button"
              class="ml-2 underline hover:text-lilac"
              @click="startNextPicture(selected)"
            >
              Start level {{ levelOf(selected) }} picture
            </button>
            <button
              v-if="hasCard(selected.pictureId)"
              type="button"
              class="ml-2 underline hover:text-lilac"
              @click="pigeonInfo?.open(selected.pictureId)"
            >
              About this pigeon
            </button>
          </template>
          <template v-else>
            <strong class="text-lilac">
              {{ justFinished === selected.id ? "Time's up! " : "" }}
            </strong>
            Pick a square and scratch it off
            <span v-if="selected.credits > 1">
              ({{ selected.credits }} squares to open)
            </span>
          </template>
        </p>

        <PictureGrid :topic="selected" />

        <AppDialog ref="plantDialog" :title="plantName(selected.plantId)">
          <div class="flex items-center gap-5">
            <img
              :src="plantImage(selected.plantId, levelOf(selected))"
              :alt="`${plantName(selected.plantId)}, ${stageName(levelOf(selected))}`"
              class="h-32 w-auto shrink-0"
            />
            <dl class="flex flex-col gap-2">
              <div>
                <dt class="text-xs uppercase tracking-wider text-white/70">
                  Current size
                </dt>
                <dd class="text-xl font-bold">
                  {{ stageName(levelOf(selected)) }}
                </dd>
                <dd class="text-sm text-white/80">
                  Level {{ levelOf(selected) }} of {{ STAGES.length }}
                </dd>
              </div>
              <div>
                <dt class="text-xs uppercase tracking-wider text-white/70">
                  Species
                </dt>
                <dd class="italic">{{ plantLatin(selected.plantId) }}</dd>
              </div>
            </dl>
          </div>
          <RouterLink
            :to="{ path: '/plants', query: { plant: selected.id } }"
            class="underline hover:text-lilac"
            >See it in your room</RouterLink
          >
        </AppDialog>
      </template>

      <p v-else class="mt-16 text-center text-xl">
        Add a topic on the left to start learning.
      </p>
    </div>

    <CorkBoard
      v-if="selected && !isArchived(selected)"
      :key="selected.id"
      :topic="selected"
    />

    <PigeonInfo ref="pigeonInfo" />
  </section>
</template>
