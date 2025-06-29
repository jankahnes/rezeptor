<template>
  <div class="flex flex-col gap-5 p-20 mx-30 items-center">
    <img class="rounded-full w-50 h-50 shadow-md" src="/placeholder-user.jpg" />
    <div class="flex flex-col justify-center px-10 md:text-start text-center">
      <span class="text-2xl font-bold">Demo User</span>
      <span class="text-sm">Joined 05.11.2024</span>
    </div>
    <div class="md:w-full w-[clamp(250px,90%,500px)] md:mx-0 mx-auto">
      <FormsChoiceSlider
        class=""
        v-model="selectedView"
        :choices="choices"
        buttonStyle="py-2"
      ></FormsChoiceSlider>
    </div>
    <div
      v-if="selectedView == 'Recipes'"u
      class="grid w-full sm:grid-cols-[repeat(auto-fit,minmax(30rem,1fr))] mx-auto gap-4"
    ></div>
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
