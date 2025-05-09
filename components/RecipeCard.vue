<template>
  <div
    class="sm:w-120 3xl:!w-140 min-h-100 sm:min-h-60 border-black border-3 font-bold shadow-[4px_4px_0_0_rgba(0,0,0,1)] grid grid-cols-1 sm:grid-cols-2"
  >
    <div class="h-full sm:p-5 pt-5 px-5">
      <img class="rounded-md" src="@/public/placeholder-dish.jpg" />
    </div>
    <div
      class="w-full sm:pt-5 pl-1 sm:pr-5 px-4 flex flex-col items-center gap-2"
    >
      <h1 class="text-center font-extrabold text-xl">Chicken Parmesan</h1>
      <div class="stars flex justify-center text-xl pb-2">
        <span class="text-yellow-500 material-icons">star</span>
        <span class="text-yellow-500 material-icons">star</span>
        <span class="text-yellow-500 material-icons">star</span>
        <span class="text-yellow-500 material-icons">star</span>
        <span class="text-yellow-500 material-icons">star_half</span>
      </div>
      <div
        class="tag-field items-center justify-center h-[25%] flex gap-x-2 gap-y-0 flex-wrap"
      >
        <Tag />
        <Tag />
        <Tag />
        <Tag />
        <Tag />
        <Tag />
        <Tag />
        <Tag />
      </div>
      <div
        class="w-[70%] sm:w-[90%] pb-4 sm:pb-0 flex justify-between items-start pt-2 text-sm font-mono"
      >
        <!-- Time -->
        <div class="flex justify-center items-center">
          <div class="flex flex-col items-center mt-3">
            <span class="text-[12px]">30</span>
            <span class="material-icons !text-[20px]">schedule</span>
          </div>
        </div>

        <!-- Macro Graph -->
        <div class="flex justify-center items-end gap-1">
          <!-- Carbs -->
          <div class="flex flex-col">
            <div class="flex flex-col gap-[1px]">
              <div class="h-2 w-2 bg-black"></div>
              <div class="h-2 w-2 bg-black"></div>
              <div class="h-2 w-2 bg-black"></div>
            </div>
            <span class="text-xs">C</span>
          </div>
          <!-- Protein -->
          <div class="flex flex-col items-center">
            <div class="flex flex-col gap-[1px]">
              <div class="h-2 w-2 bg-black"></div>
              <div class="h-2 w-2 bg-black"></div>
              <div class="h-2 w-2 bg-black"></div>
              <div class="h-2 w-2 bg-black"></div>
              <div class="h-2 w-2 bg-black"></div>
            </div>
            <span class="text-xs">P</span>
          </div>
          <!-- Fat -->
          <div class="flex flex-col items-center">
            <div class="flex flex-col gap-[1px]">
              <div class="h-2 w-2 bg-black"></div>
              <div class="h-2 w-2 bg-black"></div>
              <div class="h-2 w-2 bg-black"></div>
            </div>
            <span class="text-xs">F</span>
          </div>
        </div>

        <!-- Health Score -->
        <div class="badge flex items-center justify-center mt-6">
          <img class="absolute h-10" src="@/public/badge-a.png" />
          <span class="grade">B+</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped></style>
