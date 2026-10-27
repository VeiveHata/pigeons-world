<script setup lang="ts">
import { PLANTS, plantImage, type PlantId } from "@/plants/plants";

const model = defineModel<PlantId>({ required: true });
</script>

<template>
  <fieldset>
    <legend class="mb-2 text-sm">Choose a plant to grow</legend>
    <div class="grid grid-cols-5 gap-2">
      <label
        v-for="plant in PLANTS"
        :key="plant.id"
        class="flex cursor-pointer flex-col items-center gap-1 rounded p-2 text-center text-xs leading-tight has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-lilac"
        :class="
          model === plant.id
            ? 'bg-navy text-lilac'
            : 'text-green-pale hover:bg-navy/60'
        "
      >
        <input
          v-model="model"
          type="radio"
          name="plant"
          :value="plant.id"
          class="sr-only"
        />
        <!-- Shown at its mature stage so the choice is easy to recognise. -->
        <img :src="plantImage(plant.id, 4)" alt="" class="h-16 w-12" />
        {{ plant.name }}
      </label>
    </div>
  </fieldset>
</template>
