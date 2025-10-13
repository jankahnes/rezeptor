<template>
  <div>
    <PagesReport :id="route.params.id as string" :isFood="false" />
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
</script>

<style scoped></style>
