<template>
  <div class="p-1 sticky">
    <div class="bg-[#8a7ca92a] border-b p-2">
      <div class="flex items-center gap-2">
        <span class="material-icons text-black !text-4xl">list</span>
        <span class="text-xl font-bold">Ingredients</span>
      </div>
      <div class="w-full py-2 flex items-center gap-5">
        <div class="border flex items-center shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
          <button class="bg-black text-white border-r w-9 h-8">1</button>
          <button class="bg-white border-r w-9 h-8">2</button>
          <button class="bg-white border-r w-9 h-8">3</button>
          <button class="bg-white border-r w-9 h-8">4</button>
          <button class="bg-white w-8 h-8">
            <span class="material-icons text-black !text-2xl"
              >arrow_drop_down</span
            >
          </button>
        </div>
        <span>Servings</span>
      </div>
    </div>
    <ul class="p-4 space-y-1 text-base">
        <li>
            <span class="font-bold mr-3">100g</span>Chicken
        </li>
        <li>
            <span class="font-bold mr-3">100g</span>Chicken
        </li>
        <li>
            <span class="font-bold mr-3">100g</span>Chicken
        </li>
        <li>
            <span class="font-bold mr-3">100g</span>Chicken
        </li>
        <li>
            <span class="font-bold mr-3">100g</span>Chicken
        </li>
    </ul>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped></style>
