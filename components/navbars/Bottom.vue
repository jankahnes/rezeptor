<template>
  <nav
    class="fixed bottom-5 left-1/2 -translate-x-1/2 w-[80%] z-10 p-3 shadow-md h-14 flex justify-center rounded-lg opacity-90 metallic-gradient"
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
      <NuxtLink to="/foods" class="flex">
        <span class="material-symbols-outlined !text-3xl"> grocery </span>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts"></script>

<style scoped></style>
