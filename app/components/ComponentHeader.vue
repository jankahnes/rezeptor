<template>
  <div class="flex items-center gap-3">
    <div
      class="w-5 h-5 bg-primary rounded-full shadow-xl flex items-center justify-center"
    />
    <h2 class="text-xl font-bold">{{ capitalize(title) }}</h2>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
}>();
</script>

<style scoped></style>
