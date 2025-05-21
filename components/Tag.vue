<template>
  <div class="flex items-center justify-center gap-2 whitespace-nowrap">
    <span>{{ tag?.name }}</span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  id: Number,
});

const tag = getTagByID(props?.id);
</script>

<style scoped></style>
