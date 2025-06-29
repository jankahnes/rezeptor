<template>
  <div class="">
    <div class="relative mx-auto w-full flex justify-center">
      <HandDrawnBorder
        class="header flex items-center text-center px-10 xl:px-14 mx-auto justify-center rounded-lg p-2 overflow-visible"
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
        <h1 class="text-2xl font-bold">Instructions</h1>
      </HandDrawnBorder>
    </div>
    <ol class="p-3 space-y-1.5 mt-4">
      <li v-for="(instruction, index) in instructions">
        <div class="flex gap-2 items-center">
          <div
            class="flex-1 flex flex-col rounded-lg sm:border-2 border-gray-300"
          >
            <div class="relative min-h-20 flex items-center">
              <div
                class="flex items-center gap-2 rounded-lg py-4 px-10 w-full h-full text-lg"
              >
                <div>
                  <span>{{ index + 1 }}. {{ instruction }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
defineProps({ instructions: Array<String> });
</script>

<style scoped>
.header {
  filter: drop-shadow(3px 4px 8px rgba(0, 0, 0, 0.1));
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
