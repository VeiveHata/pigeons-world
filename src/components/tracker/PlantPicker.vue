<script setup lang="ts">
import { PLANTS, plantImage, type PlantId } from "@/plants/plants";

const model = defineModel<PlantId>({ required: true });
</script>

<template>
  <fieldset>
    <legend class="mb-2 text-sm">Choose a plant to grow</legend>
    <div class="grid grid-cols-4 gap-1">
      <label
        v-for="plant in PLANTS"
        :key="plant.id"
        class="flex cursor-pointer flex-col items-center rounded p-1 text-center text-xs leading-tight has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-lilac"
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
        <img :src="plantImage(plant.id, 4)" alt="" class="h-12 w-9" />
        {{ plant.name }}
      </label>
    </div>
  </fieldset>
</template>
