<script setup lang="ts">
import { nextTick, ref } from "vue";
import { pictureById } from "@/pictures/pictures";
import { useTracker, type Topic } from "@/tracker/useTracker";
import NewTopicDialog from "./NewTopicDialog.vue";

defineProps<{
  collapsed: boolean;
}>();

const emit = defineEmits<{
  toggle: [];
}>();

const { topics, selected, select, renameTopic, removeTopic } = useTracker();

const newTopicDialog = ref<InstanceType<typeof NewTopicDialog>>();

function confirmRemove(id: string, title: string) {
  if (confirm(`Delete "${title}" and its plant?`)) removeTopic(id);
}

// Inline renaming: only one topic is edited at a time.
const editingId = ref<string | null>(null);
const editTitle = ref("");
const editInput = ref<HTMLInputElement[]>([]);

async function startEdit(topic: Topic) {
  editingId.value = topic.id;
  editTitle.value = topic.title;
  await nextTick();
  editInput.value[0]?.select();
}

function saveEdit() {
  // Blur also fires after Enter or Escape has already closed the field.
  if (editingId.value === null) return;
  renameTopic(editingId.value, editTitle.value);
  editingId.value = null;
}

function cancelEdit() {
  editingId.value = null;
}
</script>

<template>
  <!--
    The column's width animates (see PigeonsPage). The contents keep a fixed width and the
    same padding open or collapsed, so the column just reveals them instead of reflowing,
    and the arrow button stays in the same spot.
  -->
  <aside
    class="flex flex-col gap-4 overflow-hidden bg-navy/40 px-4 py-4 md:px-2.5"
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
      class="flex flex-col gap-4 md:w-[16.75rem] md:shrink-0 md:px-1.5"
    >
      <ul class="flex flex-col gap-1">
        <li v-for="topic in topics" :key="topic.id" class="group relative flex">
          <input
            v-if="editingId === topic.id"
            ref="editInput"
            v-model="editTitle"
            type="text"
            :aria-label="`Rename ${topic.title}`"
            class="min-w-0 flex-1 rounded bg-navy px-3 py-2.5 text-lg font-bold text-lilac focus:outline focus:outline-2 focus:outline-lilac"
            @keydown.enter.prevent="saveEdit"
            @keydown.esc.prevent="cancelEdit"
            @blur="saveEdit"
          />
          <template v-else>
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
              @dblclick="startEdit(topic)"
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
                :aria-label="`Rename ${topic.title}`"
                title="Rename"
                @click="startEdit(topic)"
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
          </template>
        </li>
      </ul>

      <button
        type="button"
        class="flex items-center justify-center gap-2 rounded bg-lilac px-3 py-2 font-bold text-navy hover:bg-green-pale"
        @click="newTopicDialog?.open()"
      >
        <span aria-hidden="true">+</span> Add topic
      </button>
    </div>

    <NewTopicDialog ref="newTopicDialog" />
  </aside>
</template>
