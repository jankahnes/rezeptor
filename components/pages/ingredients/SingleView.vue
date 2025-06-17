<template>
  <div
    class="mt-2 p-3 flex flex-col max-h-[calc(100svh_-_370px)] overflow-y-auto"
  >
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
          <span>Saturated Fat</span>
          <span>Sugar</span>
          <span>Fiber</span>
          <span>Salt</span>
          <span>Vegan</span>
          <span>Vegetarian</span>
          <span>Gluten-Free</span>
          <span>Cost/100g</span>
        </div>
        <div class="flex flex-col gap-1 items-end">
          <span>{{ food.kcal }}</span>
          <span>{{ food.carbohydrates }}</span>
          <span>{{ food.protein }}</span>
          <span>{{ food.fat }}</span>
          <span>{{ food.saturated_fat }}</span>
          <span>{{ food.sugar }}</span>
          <span>{{ food.fiber }}</span>
          <span>{{ food.salt }}</span>
          <span v-if="food.vegan" class="material-symbols-outlined">
            check
          </span>
          <span v-else class="material-symbols-outlined"> close </span>
          <span v-if="food.vegetarian" class="material-symbols-outlined">
            check
          </span>
          <span v-else class="material-symbols-outlined"> close </span>
          <span v-if="food.gluten_free" class="material-symbols-outlined">
            check
          </span>
          <span v-else class="material-symbols-outlined"> close </span>
          <span>{{ food.price }}€</span>
        </div>
      </div>
      <div class="w-full sm:hidden bg-black h-[1px] my-5 mx-auto"></div>
      <div class="flex justify-between md:w-[80%] sm:mt-2">
        <div class="flex flex-col gap-1 items-start">
          <span>NutriGrade</span>
          <span>Micronutrients</span>
          <span>Satiety</span>
          <span>Fatty Acid Profile</span>
          <span>Energy Density</span>
          <span>Protein</span>
          <span>Sugar</span>
          <span>Fiber</span>
          <span>Sodium</span>
        </div>
        <div class="flex flex-col gap-1 items-end">
          <span>{{ getHidxGrade(food.hidx) }}</span>
          <span>{{ getHidxGrade(food.mnidx) }}</span>
          <span>{{ getHidxGrade(food.sidx) }}</span>
          <span>{{ getHidxGrade(food.fat_profile_score) }}</span>
          <span>{{ getHidxGrade(food.ed) }}</span>
          <span>{{ getHidxGrade(food.protein_score) }}</span>
          <span>{{ getHidxGrade(food.sugar_score) }}</span>
          <span>{{ getHidxGrade(food.fiber_score) }}</span>
          <span>{{ getHidxGrade(food.salt_score) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({ food: Object });
const branded = false;
</script>

<style scoped></style>
