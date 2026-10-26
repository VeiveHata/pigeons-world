<script setup lang="ts">
import { ref } from "vue";
import { COMPANY_NAME } from "@/constants/common";
import logo from "@/media/logo.png";
import { useTracker } from "@/tracker/useTracker";
import BackupSettings from "./backup/BackupSettings.vue";
import AppDialog from "./AppDialog.vue";
import HeaderLink from "./HeaderLink.vue";
import HeaderTimer from "./HeaderTimer.vue";
import SessionSettings from "./tracker/SessionSettings.vue";

const { settings, backupOverdue } = useTracker();

const timerDialog = ref<InstanceType<typeof AppDialog>>();
const fileDialog = ref<InstanceType<typeof AppDialog>>();
</script>

<template>
  <!-- The same on every page: dark enough for white links on any background, slightly
       see-through so the page's colours (see App.vue) tint it. -->
  <header class="bg-navy/85 backdrop-blur-sm">
    <div
      class="mx-auto flex max-w-6xl flex-wrap items-center gap-x-2 gap-y-1 px-4 py-2"
    >
      <!-- Grows like the tools on the right, so the nav stays centred -->
      <span class="hidden flex-1 md:block" aria-hidden="true"></span>

      <nav class="flex items-center gap-4 sm:gap-6" aria-label="Global">
        <HeaderLink to="/pigeons">Pigeons</HeaderLink>
        <RouterLink to="/">
          <span class="sr-only">{{ COMPANY_NAME }}</span>
          <img
            :src="logo"
            width="56"
            height="56"
            :alt="`${COMPANY_NAME} logo`"
          />
        </RouterLink>
        <HeaderLink to="/plants">Plants</HeaderLink>
      </nav>

      <div class="flex flex-1 items-center justify-end gap-1">
        <!-- Running timer and music: centred between the logo and the icons on wider screens -->
        <div class="hidden flex-1 justify-center px-3 md:flex">
          <HeaderTimer />
        </div>
        <button
          type="button"
          class="grid h-11 w-11 place-items-center rounded-full text-white hover:bg-slate focus-visible:outline focus-visible:outline-2 focus-visible:outline-lilac"
          :aria-label="`Session length: ${settings.sessionMinutes} minutes. Change it`"
          :title="`Session length: ${settings.sessionMinutes} min`"
          @click="timerDialog?.open()"
        >
          <!-- Hourglass: wooden caps and posts, glass, sand running down -->
          <svg viewBox="0 0 32 32" class="h-7 w-7" aria-hidden="true">
            <path
              class="fill-white stroke-white"
              d="M10 6.5c0 6 6 7 6 9.5s-6 3.5-6 9.5h12c0-6-6-7-6-9.5s6-3.5 6-9.5z"
              fill-opacity="0.25"
              stroke-width="1.3"
              stroke-linejoin="round"
            />
            <path class="fill-lilac" d="M11.8 9h8.4L16 13.6z" />
            <path
              class="stroke-lilac"
              d="M16 15.5v6"
              stroke-width="1"
              stroke-dasharray="0.8 1.4"
            />
            <path
              class="fill-lilac"
              d="M11 25.2c.8-2.6 2.9-3.7 5-3.7s4.2 1.1 5 3.7z"
            />
            <path
              class="stroke-cork-deep"
              d="M8.5 6.5V25.5M23.5 6.5V25.5"
              stroke-width="1.4"
            />
            <rect
              class="fill-cork stroke-cork-deep"
              x="6"
              y="3.5"
              width="20"
              height="3"
              rx="1"
            />
            <rect
              class="fill-cork stroke-cork-deep"
              x="6"
              y="25.5"
              width="20"
              height="3"
              rx="1"
            />
          </svg>
        </button>

        <button
          type="button"
          class="relative grid h-11 w-11 place-items-center rounded-full text-white hover:bg-slate focus-visible:outline focus-visible:outline-2 focus-visible:outline-lilac"
          :aria-label="
            backupOverdue
              ? 'Progress file: a new backup is due. Download or load it'
              : 'Progress file: download or load it'
          "
          :title="backupOverdue ? 'Time to download a backup' : 'Progress file'"
          @click="fileDialog?.open()"
        >
          <!-- Old kraft file folder: tab, a paper peeking out, string-and-button tie -->
          <svg viewBox="0 0 32 32" class="h-7 w-7" aria-hidden="true">
            <path
              class="fill-cork-dark stroke-wood"
              d="M3.5 9.5a1.5 1.5 0 0 1 1.5-1.5h7l2 2.2h13a1.5 1.5 0 0 1 1.5 1.5V12H3.5z"
              stroke-width="1"
              stroke-linejoin="round"
            />
            <rect
              class="fill-paper stroke-wood"
              x="7"
              y="7"
              width="17"
              height="9"
              rx="0.5"
              stroke-width="0.8"
              transform="rotate(-4 15.5 11.5)"
            />
            <path
              class="stroke-cork-deep"
              d="M9.5 9.6h9M9.6 11.6h7"
              stroke-width="0.7"
              transform="rotate(-4 15.5 11.5)"
            />
            <path
              class="fill-cork-light stroke-wood"
              d="M3 13a1.5 1.5 0 0 1 1.5-1.5h23A1.5 1.5 0 0 1 29 13v12.5a1.5 1.5 0 0 1-1.5 1.5h-23A1.5 1.5 0 0 1 3 25.5z"
              stroke-width="1"
            />
            <path class="stroke-cork-dark" d="M5 15h22" stroke-width="0.8" />
            <circle
              class="fill-cork stroke-wood"
              cx="16"
              cy="19.5"
              r="1.8"
              stroke-width="0.9"
            />
            <path
              class="stroke-wood"
              d="M16 21.3c0 2-1.8 3-3.8 3.3"
              fill="none"
              stroke-width="0.9"
              stroke-linecap="round"
            />
          </svg>
          <!-- Reminder: a new backup is due -->
          <span
            v-if="backupOverdue"
            class="absolute right-1.5 top-2 h-2.5 w-2.5 rounded-full bg-lilac ring-2 ring-navy"
            aria-hidden="true"
          ></span>
        </button>
      </div>
      <!-- On phones there's no room beside the logo: its own row, aligned right -->
      <HeaderTimer class="ml-auto md:hidden" />
    </div>

    <AppDialog ref="timerDialog" title="Session length">
      <SessionSettings />
    </AppDialog>
    <AppDialog ref="fileDialog" title="Progress file">
      <BackupSettings />
    </AppDialog>
  </header>
</template>
