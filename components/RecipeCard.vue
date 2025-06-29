<template>
  <NuxtLink :to="'/recipe/' + recipe?.id">
    <div
      class="metallic-gradient shadow rounded-lg p-5 w-100 h-140 flex flex-col hover-shine"
    >
      <h2 class="text-[34px] font-bold mb-4">
        {{ recipe?.title }}
      </h2>
      <img
        :src="recipe?.picture_url"
        class="w-full object-cover rounded-lg flex-grow"
      />
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{ recipe: RecipeProcessed }>();
</script>

<style scoped></style>
