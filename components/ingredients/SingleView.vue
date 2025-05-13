<template>
  <div>
    {{ food.name }}
  </div>
</template>

<script setup lang="ts">
const props = defineProps({ food: Object });
</script>

<style scoped></style>
