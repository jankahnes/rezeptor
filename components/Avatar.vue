<template>
  <img
    class="rounded-[25%] aspect-square shadow-md"
    :src="src"
  />
</template>

<script setup lang="ts">
const props = defineProps<{
  src: string;
}>();
</script>