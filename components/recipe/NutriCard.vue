<template>
  <div
    class="xl:w-[85%] min-h-100 border-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex flex-col font-[consolas]"
  >
    <div class="flex justify-center py-3 bg-[#91e996] items-center gap-3">
      <span class="material-icons">restaurant</span>
      <h2 class="font-bold text-2xl">NutriCard</h2>
    </div>
    <div
      class="w-full h-full flex-1 p-4 grid xl:grid-cols-[5fr_3fr] xl:gap-0 gap-5"
    >
      <div
        class="pr-3 xl:border-r xl:border-b-0 border-b flex flex-col items-center gap-1"
      >
        <h2
          class="text-xl font-bold tracking-widest px-3 border-4 border-double"
        >
          1500 kcal
        </h2>
        <p class="text-xs font-light">per Serving</p>
        <div class="w-full flex gap-2 sm:justify-between justify-center p-5">
          <div
            class="border-3 sm:w-[60%] w-[90%] p-1 shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
          >
            <!-- Nutritonal Label-->
            <div class="p-2 border flex justify-between bg-[#b1b1b1e1]">
              <div class="">
                <p>Carbs</p>
                <p>Protein</p>
                <p>Fat</p>
              </div>
              <div class="flex flex-col items-end">
                <p>40g</p>
                <p>100g</p>
                <p>20g</p>
              </div>
            </div>
            <div class="p-2 pb-0 flex justify-between text-base">
              <div class="">
                <p>Sugar</p>
                <p>Fiber</p>
                <p>Salt</p>
              </div>
              <div class="flex flex-col items-end">
                <p>40g</p>
                <p>100g</p>
                <p>20g</p>
              </div>
            </div>
          </div>
          <div class="items-center justify-end w-[40%] hidden sm:flex">
            <div
              class="h-full w-7 border-2 shadow-[3px_3px_0_0_rgba(0,0,0,1)] overflow-hidden"
            >
              <div
                class="bg-gray-400 h-[50%] transition-transform duration-100 hover:scale-110"
              ></div>
              <div
                class="bg-gray-50 h-[30%] transition-transform duration-100 hover:scale-110"
              ></div>
              <div
                class="bg-gray-700 h-[20%] transition-transform duration-100 hover:scale-110"
              ></div>
            </div>
            <div class="h-full ml-2 text-sm">
              <p class="mt-[40px]">Fat</p>
              <p class="mt-[50px]">Protein</p>
              <p class="mt-[27px]">Carbs</p>
            </div>
          </div>
        </div>
      </div>
      <div class="px-4 overflow-hidden space-y-2 w-full h-full">
        <div class="flex h-20 items-center gap-3">
          <div class="badge flex items-center justify-center w-20 relative">
            <img class="absolute h-20 w-20" src="/badge-a.png" />
            <span class="grade text-2xl z-10">B+</span>
          </div>
          <div class="">
            <p>Health</p>
            <p>Score</p>
          </div>
        </div>
        <div class="p-2 flex justify-between">
          <div class="">
            <p>Satiety Index</p>
            <p>Protein Content</p>
            <p>Salt Content</p>
            <p>Sugar Content</p>
            <p>Fiber Content</p>
            <p>Micronutrients</p>
          </div>
          <div class="flex flex-col items-start">
            <p>B</p>
            <p>B+</p>
            <p>D-</p>
            <p>A</p>
            <p>C+</p>
            <p>C-</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped></style>
