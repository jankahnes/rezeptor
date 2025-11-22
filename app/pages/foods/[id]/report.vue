<template>
  <PagesReport :id="route.params.id as string" :isFood="true" />
</template>

<script setup lang="ts">
const route = useRoute();
</script>

<style scoped></style>
