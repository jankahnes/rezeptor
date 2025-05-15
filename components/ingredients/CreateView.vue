<template>
  <div class="p-5 h-[55vh] overflow-auto">
    <div class="flex items-center gap-10">
      <div class="flex w-80 border gap-2 pl-2 mt-1 items-center">
        <span class="material-symbols-outlined"> description </span
        ><input
          class="py-2 flex-grow focus:outline-none font-bold"
          placeholder="Ingredient Name"
        />
      </div>
      <button
        class="flex bg-white h-10 border-2 border-black px-2 text-xl font-extrabold shadow-[2px_2px_0_0_rgba(0,0,0,1)] items-center justify-center gap-2"
      >
        <span class="material-symbols-outlined"> wand_stars </span>
        <span>AI</span>
      </button>
    </div>
    <div class="grid xl:grid-cols-2 grid-cols-1 py-4 ">
      <div class="flex flex-col gap-4">
        <div class="relative flex w-fit border border-black overflow-hidden">
          <div
            class="absolute top-0 left-0 h-full w-1/2 bg-black transition-transform duration-300 z-0"
            :class="{ 'translate-x-full': branded }"
          ></div>
          <button
            class="relative z-10 flex text-lg items-center justify-center gap-2 w-32 transition-colors duration-300"
            :class="branded ? 'text-black' : 'text-white'"
            @click="branded = false"
          >
            <span class="material-symbols-outlined">grocery</span>
            <span>Generic</span>
          </button>
          <button
            class="relative z-10 flex text-lg items-center justify-center gap-2 w-32 transition-colors duration-300"
            :class="branded ? 'text-white' : 'text-black'"
            @click="branded = true"
          >
            <span class="material-symbols-outlined">storefront</span>
            <span>Branded</span>
          </button>
        </div>
        <div v-if="branded" class="flex gap-4">
          <button
            class="flex bg-white border-1 border-black px-2 text-lg items-center justify-center gap-2"
          >
            <span class="material-symbols-outlined"> barcode </span>
            <span class="hidden lg:block">Add a barcode</span>
            <span class="lg:hidden text-2xl">+</span>
          </button>
          <input class="border px-3" placeholder="Brand Name" />
        </div>
        <div class="flex flex-col gap-2 max-w-100">
          <h2 class="font-semibold">Nutritional Information per 100g</h2>

          <div class="flex items-center gap-4">
            <span class="w-24">Kcal</span>
            <input class="border px-1 w-16" />
          </div>
          <div class="flex items-center gap-4">
            <span class="w-24">Carbs</span>
            <input class="border px-1 w-16" />
          </div>
          <div class="flex items-center gap-4">
            <span class="w-24">Protein</span>
            <input class="border px-1 w-16" />
          </div>
          <div class="flex items-center gap-4">
            <span class="w-24">Fat</span>
            <input class="border px-1 w-16" />
          </div>
          <div class="flex items-center gap-4">
            <span class="w-24">Sugar</span>
            <input class="border px-1 w-16" />
          </div>
          <div class="flex items-center gap-4">
            <span class="w-24">Fiber</span>
            <input class="border px-1 w-16" />
          </div>
          <div class="flex items-center gap-4">
            <span class="w-24">Salt</span>
            <input class="border px-1 w-16" />
          </div>
        </div>
      </div>
      <div class="block xl:hidden w-full bg-black h-[1px] my-5"></div>
      <div class="flex flex-col gap-4 max-w-150 justify-center">
        <div class="flex items-center gap-4">
          <span class="w-25">Price</span>

          <div class="flex gap-3">
            <span>You pay</span>
            <div class="border w-20 flex items-center px-2 gap-2">
              <input class="w-[90%] focus:outline-none" />
              <span>€</span>
            </div>
            <span>for</span>
            <input
              class="focus:outline-none px-2 border w-20"
              placeholder="Amount"
            />
            <div class="relative inline-block min-w-25">
              <FormsDropdown
                v-model="selectedUnit"
                :choices="units"
                :thin="true"
              />
            </div>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <span class="w-25">Vegan</span>
          <input type="checkbox" class="form-checkbox h-5 w-5 text-blue-600" />
        </div>
        <div class="flex items-center gap-4">
          <span class="w-25">Vegetarian</span>
          <input type="checkbox" class="form-checkbox h-5 w-5 text-blue-600" />
        </div>
        <div class="flex items-center gap-4">
          <span class="w-25">Gluten-Free</span>
          <input type="checkbox" class="form-checkbox h-5 w-5 text-blue-600" />
        </div>
        <div class="flex items-center gap-4">
          <span class="w-25 flex items-center gap-2"
            >Units<span class="material-symbols-outlined !text-xl"> info </span></span
          >
          <div class="relative inline-block min-w-25">
            <FormsMultiChoiceDropdown
              v-model="selectedUnits"
              :choices="unitClasses"
              :thin="true"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const branded = ref(false);
const units = ['g', 'pieces', 'kg', 'l', 'ml'];
const unitClasses = ['Weight', 'Volume', 'Pieces'];
const selectedUnit = ref('g');
const selectedUnits = ref([]);
</script>

<style scoped></style>
