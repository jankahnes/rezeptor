<template>
  <div class="mt-2 p-3 flex flex-col max-h-[calc(100svh_-_370px)] overflow-y-auto">
    <div class="flex justify-between items-center mt-2">
      <h2 class="sticky t-0 text-2xl font-bold">{{ food.name }}</h2>
      <button class="flex bg-white font-bold items-center justify-end gap-2">
        <span class="material-symbols-outlined"> report </span>
        <span> Propose Edits </span>
      </button>
    </div>
    <div v-if="branded" class="flex flex-col sm:flex-row gap-1 sm:gap-5">
      <span>Branded Product</span>
      <span class="hidden sm:block">|</span>
      <span>Coca Cola</span>
      <span class="hidden sm:block">|</span>
      <span class="flex items-center gap-1"
        ><span class="material-symbols-outlined"> barcode </span
        >1029332457823</span
      >
    </div>
    <span v-else>Generic</span>
    <h4 class="mt-4">Per 100g:</h4>

    <div class="grid grid-cols-1 sm:grid-cols-2 sm:gap-10">
      <div class="flex justify-between md:w-[60%] mt-2">
        <div class="flex flex-col gap-1 items-start">
          <span>Kcal</span>
          <span>Carbs</span>
          <span>Protein</span>
          <span>Fat</span>
          <span>Sugar</span>
          <span>Fiber</span>
          <span>Salt</span>
        </div>
        <div class="flex flex-col gap-1 items-end">
          <span>{{ food.kcal }}</span>
          <span>{{ food.carbs }}</span>
          <span>{{ food.protein }}</span>
          <span>{{ food.fat }}</span>
          <span>{{ food.sugar }}</span>
          <span>{{ food.fiber }}</span>
          <span>{{ food.salt }}</span>
        </div>
      </div>
      <div class="w-full sm:hidden bg-black h-[1px] my-5 mx-auto"></div>
      <div class="flex justify-between md:w-[80%] sm:mt-2">
        <div class="flex flex-col gap-1 items-start">
          <span>NutriGrade</span>
          <span>Cost</span>
          <span>Satiety</span>
          <span>Micronutrient Grade</span>
          <span>Vegan</span>
          <span>Vegetarian</span>
          <span>Gluten-Free</span>
          <span>Preferred Units</span>
          <span>Average g/U</span>
        </div>
        <div class="flex flex-col gap-1 items-end">
          <span>B</span>
          <span>0.88€</span>
          <span>79</span>
          <span>B+</span>
          <span class="material-symbols-outlined"> check </span>
          <span class="material-symbols-outlined"> check </span>
          <span class="material-symbols-outlined"> check </span>
          <span>U, g</span>
          <span>110g</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({ food: Object });
const branded = true;
</script>

<style scoped></style>
