<template>
  <div class="flex flex-col items-center mt-10 gap-12">
    <div class="flex flex-col items-center">
      <h2
        class="block px-4 py-1 bg-primary text-white rounded-lg text-lg font-bold"
      >
        NUTRITION ANALYSIS ENGINE
      </h2>
      <InstantNutritionDemo class="mt-4" />
    </div>

    <div class="flex flex-col items-center">
      <h2
        class="block px-4 py-1 bg-primary text-white rounded-lg text-lg font-bold"
      >
        WHAT DO YOU HAVE AT HOME?
      </h2>
      <HomeIngredientsDemo class="mt-4" />
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped></style>
