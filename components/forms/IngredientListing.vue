<template>
  <div class="w-full grid grid-cols-[7fr_1fr_1fr] gap-2">
    <div class="border flex items-center px-2">Chicken</div>
    <input class="bg-white border w-full h-full text-lg flex text-center" />
    <button class="bg-white p-1 !text-2xl border w-full h-full">
      <span class="material-symbols-outlined"> arrow_drop_down </span>
    </button>
  </div>
</template>

<script setup lang="ts">
const units = ['g', 'ml', 'tsp'];
</script>

<style scoped></style>
