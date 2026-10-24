<script setup lang="ts">
import { plantName, stageName } from "@/plants/plants";
import { TILE_COUNT } from "@/tracker/config";
import { levelOf, useTracker } from "@/tracker/useTracker";
import TopicList from "@/components/tracker/TopicList.vue";
import SessionTimer from "@/components/tracker/SessionTimer.vue";
import PictureGrid from "@/components/tracker/PictureGrid.vue";

const { selected, justFinished, justLeveledUp, isComplete, startNextPicture } =
  useTracker();
</script>

<template>
  <section class="flex flex-1 flex-col bg-slate text-green-pale md:flex-row">
    <TopicList />

    <div class="flex flex-1 flex-col items-center gap-8 px-4 py-10">
      <template v-if="selected">
        <div class="flex flex-col items-center gap-3">
          <h1 class="text-center text-4xl leading-tight text-lilac sm:text-6xl">
            {{ selected.title }}
          </h1>
          <RouterLink
            to="/succulents"
            class="rounded px-2 hover:bg-navy/60"
            title="See it in your room"
          >
            <span>
              Level {{ levelOf(selected) }} ·
              {{ plantName(selected.plantId) }} ({{
                stageName(levelOf(selected))
              }})
            </span>
          </RouterLink>
        </div>

        <SessionTimer :topic="selected" />

        <p class="min-h-6 text-center" aria-live="polite">
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
          <template v-else-if="selected.credits > 0">
            <strong class="text-lilac">
              {{ justFinished === selected.id ? "Time's up! " : "" }}
            </strong>
            Pick a square and scratch it off
            <span v-if="selected.credits > 1">
              ({{ selected.credits }} squares to open)
            </span>
          </template>
          <template v-else>
            Finish a session to open a square ·
            {{ TILE_COUNT - selected.revealed.length }} to the next level
          </template>
        </p>

        <PictureGrid :topic="selected" />
      </template>

      <p v-else class="mt-16 text-center text-xl">
        Add a topic on the left to start learning.
      </p>
    </div>
  </section>
</template>
