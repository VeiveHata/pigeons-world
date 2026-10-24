<script setup lang="ts">
import { ref, watch } from "vue";
import { plantName, stageName } from "@/plants/plants";
import { pictureById } from "@/pictures/pictures";
import { levelOf, useTracker } from "@/tracker/useTracker";
import TopicList from "@/components/tracker/TopicList.vue";
import SessionTimer from "@/components/tracker/SessionTimer.vue";
import PictureGrid from "@/components/tracker/PictureGrid.vue";
import CorkBoard from "@/components/notes/CorkBoard.vue";

const { selected, justFinished, justLeveledUp, isComplete, startNextPicture } =
  useTracker();

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
    class="grid flex-1 grid-cols-1 bg-slate text-green-pale transition-[grid-template-columns] duration-300 md:grid-rows-[auto_1fr] lg:grid-rows-1"
    :class="
      collapsed
        ? 'md:grid-cols-[3.5rem_minmax(0,1fr)] lg:grid-cols-[3.5rem_minmax(0,1fr)_18rem]'
        : 'md:grid-cols-[18rem_minmax(0,1fr)] lg:grid-cols-[18rem_minmax(0,1fr)_18rem]'
    "
  >
    <TopicList
      class="md:row-span-2 lg:row-span-1"
      :collapsed="collapsed"
      @toggle="collapsed = !collapsed"
    />

    <div class="flex flex-col items-center gap-8 px-4 py-10">
      <template v-if="selected">
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
              <RouterLink
                to="/plants"
                class="rounded px-1 hover:bg-navy/60 sm:-ml-1"
                title="See it in your room"
              >
                Level {{ levelOf(selected) }} ·
                {{ plantName(selected.plantId) }} ({{
                  stageName(levelOf(selected))
                }})
              </RouterLink>

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

          <SessionTimer :topic="selected" class="shrink-0" />
        </div>

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
      </template>

      <p v-else class="mt-16 text-center text-xl">
        Add a topic on the left to start learning.
      </p>
    </div>

    <CorkBoard v-if="selected" :key="selected.id" :topic="selected" />
  </section>
</template>
