<script setup lang="ts">
import { ref } from "vue";
import { pictureById } from "@/pictures/pictures";
import { TOPIC_LIMIT, useTracker } from "@/tracker/useTracker";
import EditTopicDialog from "./EditTopicDialog.vue";
import NewTopicDialog from "./NewTopicDialog.vue";

defineProps<{
  collapsed: boolean;
}>();

const emit = defineEmits<{
  toggle: [];
}>();

// Only topics still being studied; fully grown ones are in the archive on the Plants page.
const {
  activeTopics: topics,
  canAddTopic,
  selected,
  select,
  removeTopic,
} = useTracker();

const newTopicDialog = ref<InstanceType<typeof NewTopicDialog>>();

function confirmRemove(id: string, title: string) {
  if (confirm(`Delete "${title}" and its plant?`)) removeTopic(id);
}

const editDialog = ref<InstanceType<typeof EditTopicDialog>>();
</script>

<template>
  <!--
    The column's width animates (see PigeonsPage). The contents keep a fixed width and the
    same padding open or collapsed, so the column just reveals them instead of reflowing,
    and the arrow button stays in the same spot.
  -->
  <div
    class="sign sign-wide m-2 flex flex-col [--cord-inset:2.25rem] [--cord-length:260px] [--cord-width:40px] max-md:[--cord-length:0px] md:mt-[calc(var(--sign-top,1rem)-var(--header-h,0px))] md:self-start"
  >
    <aside
      class="flex flex-1 flex-col gap-4 overflow-hidden px-4 py-4 md:px-2.5"
    >
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="grid h-9 w-9 shrink-0 place-items-center rounded-full text-green-pale hover:bg-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-lilac"
          :aria-label="collapsed ? 'Show topics' : 'Hide topics'"
          :aria-expanded="!collapsed"
          aria-controls="topic-list"
          :title="collapsed ? 'Show topics' : 'Hide topics'"
          @click="emit('toggle')"
        >
          <!-- Chevron: points the way the drawer will move (down/up on phones, right/left wider) -->
          <svg
            viewBox="0 0 24 24"
            class="h-5 w-5 transition-transform"
            :class="
              collapsed ? 'rotate-90 md:rotate-0' : '-rotate-90 md:rotate-180'
            "
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <h2
          class="whitespace-nowrap text-xl text-lilac"
          :class="collapsed ? 'md:hidden' : ''"
        >
          Topics
        </h2>
      </div>

      <!-- Collapsed on wider screens: just a vertical label under the button -->
      <p
        v-if="collapsed"
        class="hidden w-9 rotate-180 select-none text-lg text-lilac [writing-mode:vertical-rl] md:block"
        aria-hidden="true"
      >
        Topics
      </p>

      <!-- Full open width (18rem minus the padding), kept while the column animates -->
      <div
        v-show="!collapsed"
        id="topic-list"
        class="flex flex-col gap-4 md:w-[15.75rem] md:shrink-0 md:px-1.5"
      >
        <ul class="flex flex-col gap-1">
          <li
            v-for="topic in topics"
            :key="topic.id"
            class="group relative flex"
          >
            <!-- Spans the whole sidebar; on wider screens the edit buttons float over its end. -->
            <button
              type="button"
              class="flex min-w-0 flex-1 items-center justify-between gap-3 rounded px-3 py-2.5 text-left"
              :class="
                topic.id === selected?.id
                  ? 'bg-navy text-lilac'
                  : 'text-green-pale hover:bg-navy/60'
              "
              @click="select(topic.id)"
              @dblclick="editDialog?.open(topic)"
            >
              <!-- Long names wrap instead of being cut off -->
              <span
                class="min-w-0 break-words text-lg font-bold leading-snug"
                >{{ topic.title }}</span
              >
              <span
                class="flex shrink-0 items-center gap-1.5 text-sm opacity-75"
              >
                <span
                  v-if="topic.timer.endsAt !== null"
                  title="Session running"
                  aria-label="Session running"
                  >⏱</span
                >
                <span
                  :title="`${topic.revealed.length} of ${pictureById(topic.pictureId).tileCount} squares opened`"
                  >{{ topic.revealed.length }}/{{
                    pictureById(topic.pictureId).tileCount
                  }}</span
                >
              </span>
            </button>
            <div
              class="flex items-center md:absolute md:inset-y-1 md:right-1 md:rounded md:bg-navy md:px-1 md:opacity-0 md:focus-within:opacity-100 md:group-hover:opacity-100"
            >
              <button
                type="button"
                class="px-2 py-1 text-green-pale opacity-70 hover:text-lilac hover:opacity-100 focus:opacity-100"
                :aria-label="`Edit ${topic.title}`"
                title="Edit name and session length"
                @click="editDialog?.open(topic)"
              >
                ✎
              </button>
              <button
                type="button"
                class="px-2 py-1 text-green-pale opacity-70 hover:text-lilac hover:opacity-100 focus:opacity-100"
                :aria-label="`Delete ${topic.title}`"
                title="Delete"
                @click="confirmRemove(topic.id, topic.title)"
              >
                ×
              </button>
            </div>
          </li>
        </ul>

        <button
          type="button"
          class="flex items-center justify-center gap-2 rounded bg-lilac px-3 py-2 font-bold text-navy hover:bg-lilac-mist disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-lilac"
          :disabled="!canAddTopic"
          aria-describedby="topic-limit"
          @click="newTopicDialog?.open()"
        >
          <span aria-hidden="true">+</span> Add topic
        </button>
        <p id="topic-limit" class="text-center text-sm text-white/70">
          {{ topics.length }} of {{ TOPIC_LIMIT }} topics<template
            v-if="!canAddTopic"
            >. Grow a plant to flowering to make room: it moves to the
            archive.</template
          >
        </p>
      </div>

      <NewTopicDialog ref="newTopicDialog" />
      <EditTopicDialog ref="editDialog" />
    </aside>
  </div>
</template>
