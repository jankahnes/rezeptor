<template>
  <div>
    <PagesReport :id="Number(route.params.id)" :isFood="false" />
  </div>
</template>

<script setup lang="ts">
const route = useRoute();


</script>

<style scoped>

</style>