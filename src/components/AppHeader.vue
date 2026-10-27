<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { COMPANY_NAME } from "@/constants/common";
import logo from "@/media/logo.png";
import pigeonIcon from "@/media/icon-pigeon.svg";
import plantIcon from "@/media/icon-plant.svg";
import { useTracker } from "@/tracker/useTracker";
import BackupSettings from "./backup/BackupSettings.vue";
import AppDialog from "./AppDialog.vue";
import HeaderLink from "./HeaderLink.vue";
import HeaderTimer from "./HeaderTimer.vue";
import SessionSettings from "./tracker/SessionSettings.vue";

const { settings, backupOverdue } = useTracker();

const timerDialog = ref<InstanceType<typeof AppDialog>>();

// How much room the header takes and where its signs hang, as --header-h and --sign-top on
// the page, so the Topics sign can be pulled up to hang at the same level as them. On wide
// screens the header floats over the page (it takes no room), so its height is 0 there.
const header = ref<HTMLElement>();
let resizeObserver: ResizeObserver | undefined;
function measure() {
  if (!header.value) return;
  const root = document.documentElement.style;
  const floating = getComputedStyle(header.value).position === "absolute";
  root.setProperty(
    "--header-h",
    floating
      ? "0px"
      : `${Math.round(header.value.getBoundingClientRect().height)}px`,
  );
  const sign = header.value.querySelector("nav .sign");
  if (sign) {
    root.setProperty(
      "--sign-top",
      `${Math.round(sign.getBoundingClientRect().top)}px`,
    );
  }
}
onMounted(() => {
  resizeObserver = new ResizeObserver(measure);
  if (header.value) resizeObserver.observe(header.value);
  window.addEventListener("resize", measure);
  measure();
});
onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  window.removeEventListener("resize", measure);
});
const fileDialog = ref<InstanceType<typeof AppDialog>>();
</script>

<template>
  <!-- All the signs sit on the right. On wide screens (xl) the header floats over the page, so the
       page's content can start at the top, in the space on the left. -->
  <header
    ref="header"
    class="relative z-10 xl:pointer-events-none xl:absolute xl:inset-x-0 xl:top-0"
  >
    <div
      class="header-shadow flex flex-wrap items-center justify-end gap-x-2 gap-y-1 px-4 pb-0 pt-4"
    >
      <!-- Running timer and music: in the middle of the header on wide screens -->
      <div
        class="pointer-events-auto absolute left-1/2 top-[51px] hidden -translate-x-1/2 -translate-y-1/2 xl:block"
      >
        <HeaderTimer />
      </div>

      <nav
        class="pointer-events-auto flex items-center gap-2"
        aria-label="Global"
      >
        <HeaderLink to="/pigeons" label="Pigeons">
          <img
            :src="pigeonIcon"
            alt=""
            class="h-[52px] w-[52px] object-contain"
          />
        </HeaderLink>
        <RouterLink to="/" class="sign sway block p-1.5 [--cord-width:28px]">
          <span class="sr-only">{{ COMPANY_NAME }}</span>
          <img
            :src="logo"
            width="56"
            height="56"
            :alt="`${COMPANY_NAME} logo`"
          />
        </RouterLink>
        <HeaderLink to="/plants" label="Plants">
          <img
            :src="plantIcon"
            alt=""
            class="h-[52px] w-[52px] object-contain"
          />
        </HeaderLink>
      </nav>

      <div class="pointer-events-auto flex items-center gap-1">
        <button
          type="button"
          class="sign sway grid h-11 w-11 place-items-center text-white [--cord-width:28px] hover:bg-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-lilac"
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
          class="sign sway relative grid h-11 w-11 place-items-center text-white [--cord-width:28px] hover:bg-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-lilac"
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
      <!-- Below the widest screens the player has its own row under the signs, aligned right -->
      <div class="pointer-events-auto flex w-full justify-end xl:hidden">
        <HeaderTimer />
      </div>
    </div>

    <AppDialog ref="timerDialog" title="Session length">
      <SessionSettings />
    </AppDialog>
    <AppDialog ref="fileDialog" title="Progress file">
      <BackupSettings />
    </AppDialog>
  </header>
</template>
