<template>
  <PagesReport :id="Number(route.params.id)" :isFood="true" />
</template>

<script setup lang="ts">
const route = useRoute();
</script>

<style scoped></style>
