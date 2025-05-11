<template>
  <NuxtLink to="/recipe/1" custom v-slot="{ navigate, href }">
    <a
      class="w-90 sm:w-120 3xl:!w-140 min-h-100 sm:min-h-60 border-black border-3 font-bold shadow-[4px_4px_0_0_rgba(0,0,0,1)] grid grid-cols-1 sm:grid-cols-2"
      :href="href"
      @click="navigate"
    >
      <div class="h-full w-full sm:p-5 pt-5 px-5">
        <img class="rounded-md" src="/placeholder-dish.jpg" />
      </div>
      <div
        class="w-full h-full sm:pt-5 pl-1 sm:pr-5 px-4 flex flex-col items-center gap-2"
      >
        <h1 class="text-center font-extrabold text-xl">Chicken Parmesan</h1>
        <div class="stars flex justify-center text-xl pb-2">
          <span class="text-[#91e996] material-icons">star</span>
          <span class="text-[#91e996] material-icons">star</span>
          <span class="text-[#91e996] material-icons">star</span>
          <span class="text-[#91e996] material-icons">star</span>
          <span class="text-[#91e996] material-icons">star_half</span>
        </div>
        <div
          class="tag-field items-center justify-center h-[25%] flex gap-x-2 gap-y-1 flex-wrap"
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
          class="w-[70%] sm:w-[90%] sm:pb-0 flex justify-between items-end mb-5 text-sm font-mono h-full"
        >
          <!-- Time -->
          <div class="flex justify-center items-center mb-1">
            <div class="flex flex-col items-center">
              <span class="text-[12px]">30</span>
              <span class="material-icons !text-[20px] -mt-1">schedule</span>
            </div>
          </div>
          <!-- Macro Graph -->
          <div class="flex items-end gap-1">
            <!-- Carbs -->
            <div class="flex flex-col items-center">
              <div class="flex flex-col-reverse gap-[1px]">
                <div class="h-[7px] w-[7px] bg-black"></div>
                <div class="h-[7px] w-[7px] bg-black"></div>
                <div class="h-[7px] w-[7px] bg-black"></div>
              </div>
              <span class="text-xs">C</span>
            </div>
            <!-- Protein -->
            <div class="flex flex-col items-center">
              <div class="flex flex-col-reverse gap-[1px]">
                <div class="h-[7px] w-[7px] bg-black"></div>
                <div class="h-[7px] w-[7px] bg-black"></div>
                <div class="h-[7px] w-[7px] bg-black"></div>
                <div class="h-[7px] w-[7px] bg-black"></div>
                <div class="h-[7px] w-[7px] bg-black"></div>
              </div>
              <span class="text-xs">P</span>
            </div>
            <!-- Fat -->
            <div class="flex flex-col items-center">
              <div class="flex flex-col-reverse gap-[1px]">
                <div class="h-[7px] w-[7px] bg-black"></div>
                <div class="h-[7px] w-[7px] bg-black"></div>
              </div>
              <span class="text-xs">F</span>
            </div>
          </div>
          <!-- Health Score -->
          <div class="badge flex items-center justify-center mb-3">
            <img class="absolute h-10" src="/badge-a.png" />
            <span class="grade">B+</span>
          </div>
        </div>
      </div>
    </a>
  </NuxtLink>
</template>

<script setup lang="ts"></script>

<style scoped></style>
