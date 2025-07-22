<template>
  <div class="">
    <div class="relative mx-auto w-full flex justify-center">
      <div
        class="header flex items-center text-center px-10 xl:px-14 mx-auto justify-center rounded-lg p-2 overflow-visible"
      >
        <h1 class="text-3xl font-bold">Instructions</h1>
      </div>
    </div>
    <ul class="p-3 mt-8 space-y-2">
      <li v-for="(instruction, index) in instructions">
        <div
          class="flex items-center gap-2 rounded-lg py-5 px-10 w-full h-full text-lg shadow-sm"
        >
          <span>{{ index + 1 }}. {{ instruction }}</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
defineProps({ instructions: Array<String> });
</script>

<style scoped></style>
