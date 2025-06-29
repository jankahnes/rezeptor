<template>
  <nav
    class="bg-[#fffefc] fixed bottom-0 w-full z-10 p-3 border-t-3 h-18 flex"
  >
    <div class="flex justify-between items-center w-full mx-3 xs:mx-12">
      <NuxtLink to="/" class="flex">
        <span class="material-symbols-outlined !text-3xl"> home </span>
      </NuxtLink>
      <NuxtLink to="/recipes" class="flex">
        <span class="material-symbols-outlined !text-3xl"> search </span>
      </NuxtLink>
      <NuxtLink to="/recipe/new" class="flex">
        <span class="material-symbols-outlined !text-3xl"> add </span>
      </NuxtLink>
      <NuxtLink to="/ingredients" class="flex">
        <span class="material-symbols-outlined !text-3xl"> grocery </span>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts"></script>

<style scoped></style>
