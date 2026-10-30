<script setup lang="ts">
import { computed, ref } from "vue";
import AppDialog from "@/components/AppDialog.vue";
import { licenseUrl, pictureById } from "@/pictures/pictures";

// What's known about a pigeon card: its name, the kind, who drew it, and its licence.
// Opened when a picture is finished, and from the collection on the home page.

const dialog = ref<InstanceType<typeof AppDialog>>();
const shownId = ref("");
const picture = computed(() => pictureById(shownId.value));

function open(pictureId: string) {
  shownId.value = pictureId;
  dialog.value?.open();
}

defineExpose({ open });
</script>

<template>
  <AppDialog ref="dialog" :title="picture.name">
    <dl v-if="picture.card" class="flex flex-col gap-3 text-sm">
      <div>
        <dt class="text-xs uppercase tracking-wider text-white/70">Kind</dt>
        <dd class="text-base font-bold">{{ picture.card.kind }}</dd>
      </div>
      <div>
        <dt class="text-xs uppercase tracking-wider text-white/70">Drawing</dt>
        <dd>{{ picture.card.credit }}</dd>
      </div>
      <div>
        <dt class="text-xs uppercase tracking-wider text-white/70">Licence</dt>
        <dd>
          <a
            :href="licenseUrl(picture.card.license)"
            target="_blank"
            rel="noopener"
            class="underline hover:text-lilac"
            >{{ picture.card.license }}</a
          >
          · free to use
        </dd>
      </div>
      <div>
        <dt class="text-xs uppercase tracking-wider text-white/70">Source</dt>
        <dd>
          <a
            :href="picture.card.url"
            target="_blank"
            rel="noopener"
            class="underline hover:text-lilac"
            >Wikimedia Commons</a
          >
        </dd>
      </div>
    </dl>
  </AppDialog>
</template>
