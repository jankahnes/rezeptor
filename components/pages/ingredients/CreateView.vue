<template>
  <div
    class="px-5 pt-10 max-h-[calc(100svh_-_370px)] overflow-y-auto overflow-auto"
    v-if="state === 'editing'"
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
        class="relative h-10 rounded-xl p-[3px] overflow-hidden"
        :class="{ loading: loading }"
        @click="autocomplete()"
      >
        <FormsAIBorder class="rounded-xl" :spinning="loading" />

        <span
          class="relative flex bg-white rounded-[9px] h-full w-full items-center justify-center gap-2 px-4 text-xl font-extrabold"
        >
          <span class="material-symbols-outlined">wand_stars</span>
          <span>AI</span>
        </span>
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
            <transition name="fade" mode="out-in">
              <FormsSkeleton
                v-if="loading"
                class="w-16 border h-[26px] p-[3px]"
              ></FormsSkeleton>
              <input v-else class="border px-1 w-16 target" v-model="food.kcal"
            /></transition>
          </div>
          <div class="flex items-center gap-4">
            <span class="w-29">Carbs</span>
            <transition name="fade" mode="out-in">
              <FormsSkeleton
                v-if="loading"
                class="w-16 border h-[26px] p-[3px]"
              ></FormsSkeleton>
              <input
                v-else
                class="border px-1 w-16 target"
                v-model="food.carbohydrates"
            /></transition>
          </div>
          <div class="flex items-center gap-4">
            <span class="w-29">Protein</span>
            <transition name="fade" mode="out-in">
              <FormsSkeleton
                v-if="loading"
                class="w-16 border h-[26px] p-[3px]"
              ></FormsSkeleton>
              <input
                v-else
                class="border px-1 w-16 target"
                v-model="food.protein"
            /></transition>
          </div>
          <div class="flex items-center gap-4">
            <span class="w-29">Fat</span>
            <transition name="fade" mode="out-in">
              <FormsSkeleton
                v-if="loading"
                class="w-16 border h-[26px] p-[3px]"
              ></FormsSkeleton>
              <input v-else class="border px-1 w-16 target" v-model="food.fat"
            /></transition>
          </div>
          <div class="flex items-center gap-4">
            <span class="w-29">Saturated Fat</span>
            <transition name="fade" mode="out-in">
              <FormsSkeleton
                v-if="loading"
                class="w-16 border h-[26px] p-[3px]"
              ></FormsSkeleton>
              <input
                v-else
                class="border px-1 w-16 target"
                v-model="food.saturated_fat"
            /></transition>
          </div>
          <div class="flex items-center gap-4">
            <span class="w-29">Sugar</span>
            <transition name="fade" mode="out-in">
              <FormsSkeleton
                v-if="loading"
                class="w-16 border h-[26px] p-[3px]"
              ></FormsSkeleton>
              <input
                v-else
                class="border px-1 w-16 target"
                v-model="food.sugar"
            /></transition>
          </div>
          <div class="flex items-center gap-4">
            <span class="w-29">Fiber</span>
            <transition name="fade" mode="out-in">
              <FormsSkeleton
                v-if="loading"
                class="w-16 border h-[26px] p-[3px]"
              ></FormsSkeleton>
              <input
                v-else
                class="border px-1 w-16 target"
                v-model="food.fiber"
            /></transition>
          </div>
          <div class="flex items-center gap-4">
            <span class="w-29">Salt</span>
            <transition name="fade" mode="out-in">
              <FormsSkeleton
                v-if="loading"
                class="w-16 border h-[26px] p-[3px]"
              ></FormsSkeleton>
              <input v-else class="border px-1 w-16 target" v-model="food.salt"
            /></transition>
          </div>
        </div>
      </div>
      <div class="block xl:hidden w-full bg-black h-[1px] my-5"></div>
      <div class="flex flex-col gap-4 max-w-150 justify-center xl:pt-30">
        <div class="flex items-center gap-4">
          <span class="w-25">Price</span>

          <div class="flex gap-3 whitespace-nowrap">
            <span class="hidden md:block">You pay</span>
            <transition name="fade" mode="out-in">
              <FormsSkeleton
                v-if="loading"
                class="w-16 md:w-20 border h-[26px] p-[3px]"
              ></FormsSkeleton>
              <div
                v-else
                class="text-sm md:text-base border w-16 md:w-20 flex items-center px-1 md:px-2 gap-2 target"
              >
                <input
                  class="w-[90%] focus:outline-none"
                  v-model="priceValue"
                />
                <span>€</span>
              </div></transition
            >
            <span class="hidden md:block">for</span>
            <span class="md:hidden">/</span>
            <transition name="fade" mode="out-in">
              <FormsSkeleton
                v-if="loading"
                class="w-13 md:w-20 border h-[26px] p-[3px]"
              ></FormsSkeleton>
              <input
                v-else
                class="focus:outline-none px-2 border w-13 md:w-20 target"
                :placeholder="isMdUp ? 'Amount' : 'Amt'"
                v-model="priceAmount"
            /></transition>
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
          <transition name="fade" mode="out-in">
            <FormsSkeleton
              v-if="loading"
              class="h-5 w-5 border border-gray-500 rounded-xs p-[1px]"
            ></FormsSkeleton>
            <input
              v-else
              type="checkbox"
              class="form-checkbox h-5 w-5 text-blue-600 target"
              v-model="food.vegan"
          /></transition>
        </div>
        <div class="flex items-center gap-4">
          <span class="w-25">Vegetarian</span>
          <transition name="fade" mode="out-in">
            <FormsSkeleton
              v-if="loading"
              class="h-5 w-5 border border-gray-500 rounded-xs p-[1px]"
            ></FormsSkeleton>
            <input
              v-else
              type="checkbox"
              class="form-checkbox h-5 w-5 text-blue-600 target"
              v-model="food.vegetarian"
          /></transition>
        </div>
        <div class="flex items-center gap-4">
          <span class="w-25">Gluten-Free</span>
          <transition name="fade" mode="out-in">
            <FormsSkeleton
              v-if="loading"
              class="h-5 w-5 border border-gray-500 rounded-xs p-[1px]"
            ></FormsSkeleton>
            <input
              v-else
              type="checkbox"
              class="form-checkbox h-5 w-5 text-blue-600 target"
              v-model="food.gluten_free"
          /></transition>
        </div>
        <div class="flex items-center gap-4 mb-16">
          <span class="w-25 flex items-center gap-2"
            >Units<span class="material-symbols-outlined !text-xl">
              info
            </span></span
          >
          <transition name="fade" mode="out-in">
            <FormsSkeleton
              v-if="loading"
              class="h-[26px] w-25 border border-gray-500 rounded-xs p-[3px]"
            ></FormsSkeleton>
            <div v-else class="relative inline-block min-w-25 target">
              <FormsMultiChoiceDropdown
                v-model="food.measurements"
                :choices="unitClasses"
                :thin="true"
              /></div
          ></transition>
        </div>
        <button
          class="bg-white h-8 border-1 border-black w-50 text-lg font-extrabold shadow-[1px_1px_0_0_rgba(0,0,0,1)] items-center justify-center gap-2"
          @click="submit"
        >
          <span>Submit</span>
        </button>
      </div>
    </div>
  </div>
  <div
    v-else
    class="flex flex-col items-center justify-center text-center py-20"
  >
    <div v-if="state === 'uploading'" class="space-y-5">
      <Vue3Lottie animationLink="./loading.json" :height="100" :width="100" />
    </div>
    <div v-else class="space-y-5">
      <Vue3Lottie
        animationLink="./check.json"
        :loop="false"
        :height="100"
        :width="100"
      />
      <p v-if="state === 'finished'" class="pt-10">Upload Successful.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core';
import { useSupabase } from '~/composables/useSupabase';
const isMdUp = useMediaQuery('(min-width: 768px)');
const state = ref('editing');
const emptyFood = {
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
};
const food = ref(structuredClone(emptyFood));
const customAttrs = [
  'name',
  'kcal',
  'protein',
  'carbohydrates',
  'salt',
  'fiber',
  'saturated_fat',
  'fat',
  'sugar',
  'vegan',
  'vegetarian',
  'gluten_free',
  'measurements',
  'avg_price',
];
const hiddenAttrs = ['density', 'piece_weight'];
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
const loading = ref(false);

async function autocomplete() {
  loading.value = true;
  if (food.value.name) {
    loading.value = true;
    const gptResponse = await gptIngredientAutocomplete(food.value.name);
    loading.value = false;
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

async function submit() {
  state.value = 'uploading';
  for (const key in customAttrs) {
    if (
      food.value[key] === null ||
      food.value[key] === '' ||
      food.value[key]?.length == 0 ||
      food.value[key] === false
    ) {
      console.log('All fields must be filled.');
      return;
    }
  }
  const hiddenAttrsResponse = await gptGetHiddenAttrs(food.value.name);
  for (const key in hiddenAttrsResponse) {
    food.value[key] = hiddenAttrsResponse[key];
  }
  food.value.avg_price = getPricePer100(
    food.value,
    priceValue.value,
    priceAmount.value,
    priceSelectedUnit.value
  );
  food.value.measurements = food.value.measurements.map((str) =>
    str.toLowerCase()
  );
  const supabase = useSupabase();
  const { data, error } = await supabase.from('foods').insert(food.value);
  if (error) {
    console.error('Upload failed:', error);
  } else {
    console.log('Row inserted:', data);
  }
  state.value = 'animate';
  setTimeout(() => {
    state.value = 'finished';
  }, 1200);
  setTimeout(() => {
    food.value = structuredClone(emptyFood);
    state.value = 'editing';
  }, 2000);
}
</script>

<style scoped>
.fade-enter-active {
  transition: all 0.3s ease;
}
.fade-enter-from.target {
  opacity: 0;
  transform: translateX(1px);
  transform: translateY(1px);
}
.fade-leave-to.target {
  opacity: 0;
  transform: translateX(-1px);
  transform: translateY(-1px);
}
</style>
