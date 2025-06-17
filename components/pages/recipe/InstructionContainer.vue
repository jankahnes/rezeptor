<template>
  <div class="font-[Caveat_Brush]">
    <div class="relative mx-auto w-full flex justify-center">
      <HandDrawnBorder
        class="flex items-center text-center px-10 xl:px-14 mx-auto justify-center rounded-lg p-2 overflow-visible"
        :stroke-color="'#77f77b'"
        :stroke-width="1"
        :bg-color="'#fdf5ea'"
        :roughness="1"
        :blur="0.2"
      >
      <div
          class="tape absolute -top-3 -right-12 w-8 h-4 bg-gray-200 opacity-90 transform -rotate-6"
        ></div>
        <div
          class="tape absolute -top-3 -left-12 w-8 h-4 bg-gray-200 opacity-90 transform rotate-6"
        ></div>
        <h1 class="text-3xl font-bold">Instructions</h1>
      </HandDrawnBorder>
    </div>
    <ol class="p-3 space-y-1.5 mt-4">
      <li v-for="(instruction, index) in instructions">
        <div class="flex gap-2 items-center">
          <!--<div
            class="items-center gap-2 bg-amber-50 border-2 border-amber-200 rounded-lg p-4 shadow-md h-14 w-14 justify-center font-bold hidden sm:flex"
          >
            <span class="text-bold text-2xl"> {{ index + 1 }} </span>
          </div>-->
          <HandDrawnBorder
            class="flex-1 transform transition-transform duration-300 hover:scale-101 hover:rotate-[0.3deg]"
            strokeColor="#77f77b"
            :strokeWidth="1"
            bgColor="#fdf5ea"
            :roughness="0.7"
            :blur="0.2"
          >
            <div class="relative h-20">
              <div
                class="flex items-center gap-2 rounded-lg py-4 px-10 w-full h-full font-[Caveat_Brush] text-xl"
              >
                <div
                  class="tape absolute top-0 right-4 w-12 h-5 bg-gray-200 opacity-90 transform -rotate-12"
                ></div>
                <div>
                  <span>{{ instruction }}</span>
                </div>
              </div>
            </div>
          </HandDrawnBorder>
        </div>
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
defineProps({ instructions: Array<String> });
</script>

<style scoped>
.relative {
  filter: drop-shadow(3px 4px 8px rgba(0, 0, 0, 0.15));
}

.tape {
  background: linear-gradient(
    45deg,
    rgb(229, 231, 235) 0%,
    rgb(209, 213, 219) 50%,
    rgb(229, 231, 235) 100%
  );
  border-radius: 1px;
  filter: drop-shadow(rgba(0, 0, 0, 0.1) 1px 1px 2px);
}
</style>
