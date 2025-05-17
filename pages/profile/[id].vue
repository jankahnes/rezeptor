<template>
  <div class="grid md:grid-cols-[1fr_3fr] grid-cols-1 pt-5 sm:p-10 gap-5">
    <div class="max-w-100 mx-auto">
      <img class="sm:border-2" src="/placeholder-user.jpg" />
    </div>
    <div class="flex flex-col justify-center px-10 md:text-start text-center">
      <span class="text-2xl font-bold">Demo Danny</span>
      <span class="text-sm">Joined 05.11.2024</span>
    </div>
    <div class="md:w-full w-[clamp(250px,90%,500px)] md:mx-0 mx-auto">
      <FormsChoiceSlider
        class="hidden md:block"
        v-model="selectedView"
        :choices="choices"
        :vertical="true"
        buttonStyle="py-2 justify-start px-3"
      ></FormsChoiceSlider>
      <FormsChoiceSlider
        class="md:hidden"
        v-model="selectedView"
        :choices="choices"
        :hideLabel="true"
        buttonStyle="py-2"
      ></FormsChoiceSlider>
    </div>
    <div
      v-if="selectedView == 'Recipes'"
      class="grid w-full sm:grid-cols-[repeat(auto-fit,minmax(30rem,1fr))] mx-auto gap-4"
    >
      <div class="flex justify-center"><RecipeCard /></div>
      <div class="flex justify-center"><RecipeCard /></div>
      <div class="flex justify-center"><RecipeCard /></div>
      <div class="flex justify-center"><RecipeCard /></div>
      <div class="flex justify-center"><RecipeCard /></div>
    </div>
  </div>
</template>

<script setup lang="ts">
const choices = [
  ['Recipes', 'menu_book'],
  ['Comments', 'chat'],
  ['Statistics', 'analytics'],
  ['Settings', 'settings'],
];
const selectedView = ref('Recipes');
</script>

<style scoped></style>
