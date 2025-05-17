<template>
  <div
    class="px-5 pt-10 max-h-[calc(100svh_-_370px)] overflow-y-auto overflow-auto"
  >
    <div class="flex items-center gap-10">
      <div class="flex w-80 border gap-2 pl-2 mt-1 items-center">
        <span class="material-symbols-outlined"> description </span
        ><input
          class="py-2 flex-grow focus:outline-none font-bold"
          placeholder="Ingredient Name"
          v-model="food.name"
        />
      </div>
      <button
        class="flex bg-white h-10 border-2 border-black px-2 text-xl font-extrabold shadow-[2px_2px_0_0_rgba(0,0,0,1)] items-center justify-center gap-2"
        @click="autocomplete()"
      >
        <span class="material-symbols-outlined"> wand_stars </span>
        <span>AI</span>
      </button>
    </div>
    <div class="grid xl:grid-cols-2 grid-cols-1 py-4">
      <div class="flex flex-col gap-4">
        <div class="w-80">
          <FormsChoiceSlider v-model="type" :choices="choices" />
        </div>
        <div v-if="type == 'Branded'" class="flex gap-4 max-w-80">
          <button
            class="flex bg-white border-1 border-black px-2 text-lg items-center justify-center gap-2 lg:min-w-45"
          >
            <span class="material-symbols-outlined"> barcode </span>
            <span class="hidden lg:block">Add a barcode</span>
            <span class="lg:hidden text-2xl">+</span>
          </button>
          <input class="border px-3 flex-1 min-w-0" placeholder="Brand Name" />
        </div>
        <div class="flex flex-col gap-2 max-w-100">
          <h2 class="font-semibold">Nutritional Information per 100g:</h2>

          <div class="flex items-center gap-4">
            <span class="w-29">Kcal</span>
            <input class="border px-1 w-16" v-model="food.kcal" />
          </div>
          <div class="flex items-center gap-4">
            <span class="w-29">Carbs</span>
            <input class="border px-1 w-16" v-model="food.carbohydrates" />
          </div>
          <div class="flex items-center gap-4">
            <span class="w-29">Protein</span>
            <input class="border px-1 w-16" v-model="food.protein" />
          </div>
          <div class="flex items-center gap-4">
            <span class="w-29">Fat</span>
            <input class="border px-1 w-16" v-model="food.fat" />
          </div>
          <div class="flex items-center gap-4">
            <span class="w-29">Saturated Fat</span>
            <input class="border px-1 w-16" v-model="food.saturated_fat" />
          </div>
          <div class="flex items-center gap-4">
            <span class="w-29">Sugar</span>
            <input class="border px-1 w-16" v-model="food.sugar" />
          </div>
          <div class="flex items-center gap-4">
            <span class="w-29">Fiber</span>
            <input class="border px-1 w-16" v-model="food.fiber" />
          </div>
          <div class="flex items-center gap-4">
            <span class="w-29">Salt</span>
            <input class="border px-1 w-16" v-model="food.salt" />
          </div>
        </div>
      </div>
      <div class="block xl:hidden w-full bg-black h-[1px] my-5"></div>
      <div class="flex flex-col gap-4 max-w-150 justify-center xl:pt-30">
        <div class="flex items-center gap-4">
          <span class="w-25">Price</span>

          <div class="flex gap-3 whitespace-nowrap">
            <span class="hidden md:block">You pay</span>
            <div
              class="text-sm md:text-base border w-16 md:w-20 flex items-center px-1 md:px-2 gap-2"
            >
              <input class="w-[90%] focus:outline-none" v-model="priceValue" />
              <span>€</span>
            </div>
            <span class="hidden md:block">for</span>
            <span class="md:hidden">/</span>
            <input
              class="focus:outline-none px-2 border w-13 md:w-20"
              :placeholder="isMdUp ? 'Amount' : 'Amt'"
              v-model="priceAmount"
            />
            <div class="relative inline-block min-w-10">
              <FormsDropdown
                v-model="priceSelectedUnit"
                :choices="units"
                :thin="true"
              />
            </div>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <span class="w-25">Vegan</span>
          <input
            type="checkbox"
            class="form-checkbox h-5 w-5 text-blue-600"
            v-model="food.vegan"
          />
        </div>
        <div class="flex items-center gap-4">
          <span class="w-25">Vegetarian</span>
          <input
            type="checkbox"
            class="form-checkbox h-5 w-5 text-blue-600"
            v-model="food.vegetarian"
          />
        </div>
        <div class="flex items-center gap-4">
          <span class="w-25">Gluten-Free</span>
          <input
            type="checkbox"
            class="form-checkbox h-5 w-5 text-blue-600"
            v-model="food.gluten_free"
          />
        </div>
        <div class="flex items-center gap-4 mb-16">
          <span class="w-25 flex items-center gap-2"
            >Units<span class="material-symbols-outlined !text-xl">
              info
            </span></span
          >
          <div class="relative inline-block min-w-25">
            <FormsMultiChoiceDropdown
              v-model="food.measurements"
              :choices="unitClasses"
              :thin="true"
            />
          </div>
        </div>
        <button
          class="bg-white h-8 border-1 border-black w-50 text-lg font-extrabold shadow-[1px_1px_0_0_rgba(0,0,0,1)] items-center justify-center gap-2"
        >
          <span>Submit</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core';
import gptIngredientAutocomplete from '~/utils/gptIngredientAutocomplete';
const isMdUp = useMediaQuery('(min-width: 768px)');
const food = ref({
  name: '',
  kcal: null,
  protein: null,
  carbohydrates: null,
  salt: null,
  fiber: null,
  saturated_fat: null,
  fat: null,
  sugar: null,
  vegan: false,
  vegetarian: false,
  gluten_free: false,
  measurements: [],
  avg_price: null,
  density: null,
  piece_weight: null,
});
const choices = [
  ['Generic', 'grocery'],
  ['Branded', 'storefront'],
];
const type = ref('Generic');
const units = ['g', 'pcs', 'kg', 'l', 'ml'];
const unitClasses = ['Weight', 'Volume', 'Pieces'];
const priceValue = ref(null);
const priceAmount = ref(null);
const priceSelectedUnit = ref('g');

async function autocomplete() {
  if (food.value.name) {
    const gptResponse = await gptIngredientAutocomplete(food.value.name);
    for (const key in gptResponse) {
      if (
        food.value[key] === null ||
        food.value[key] === '' ||
        food.value[key]?.length == 0 ||
        food.value[key] === false
      ) {
        food.value[key] = gptResponse[key];
      }
    }
    priceValue.value = food.value['avg_price'];
    priceAmount.value = 100;
    priceSelectedUnit.value = 'g';
  }
}
</script>

<style scoped></style>
