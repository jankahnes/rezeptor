<template>
  <div>
    <h1 class="text-3xl font-bold">Instructions</h1>
    <ol class="p-3 space-y-1.5 list-decimal list-inside">
      <li v-for="instruction in instructions">{{ instruction }}</li>
    </ol>
  </div>
</template>

<script setup lang="ts">
defineProps({ instructions: Array<String> });
</script>

<style scoped></style>
