<script setup lang="ts">
import { COMPANY_NAME } from "@/constants/common";
import logo from "@/media/logo.png";
import HeaderLink from "./HeaderLink.vue";
</script>

<template>
  <header class="bg-navy">
    <nav
      class="mx-auto flex items-center justify-center p-6 lg:px-8"
      aria-label="Global"
    >
      <HeaderLink to="/pigeons" class="text-lilac">Pigeons</HeaderLink>
      <RouterLink to="/" class="pl-6 pr-6">
        <span class="sr-only">{{ COMPANY_NAME }}</span>
        <img
          :src="logo"
          width="100"
          height="100"
          :alt="`${COMPANY_NAME} logo`"
        />
      </RouterLink>
      <HeaderLink to="/succulents" class="text-green-light"
        >Succulents</HeaderLink
      >
    </nav>
  </header>
</template>
