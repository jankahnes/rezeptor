<template>
  <NuxtLink
    v-if="recipe"
    :to="'/recipe/' + recipe?.id"
    class="metallic-gradient shadow rounded-lg flex flex-col hover-shine p-4"
  >
    <h2 class=" font-bold mb-4">
      {{ recipe?.title }}
    </h2>
    <img
      :src="recipe?.picture_url"
      class="w-full object-cover rounded-lg flex-grow"
    />
  </NuxtLink>
  <Skeleton v-else />
</template>

<script setup lang="ts">
const props = defineProps<{ recipe: RecipeProcessed }>();
</script>

<style scoped></style>
