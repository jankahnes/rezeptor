<template>
  <div class="h-full flex flex-col min-w-92">
    <div class="p-2 md:p-6 !pb-3" v-if="!hideHeader">
      <div class="flex justify-between items-center w-full mb-2">
        <div
          class="px-4 py-1 bg-primary text-white rounded-lg"
          v-if="!hideHeader"
        >
          <h2 class="text-lg font-bold">METHOD</h2>
        </div>
        <transition name="fade-slide" mode="out-in">
          <button
            class="button flex items-center gap-2 px-2 py-1 font-medium !bg-primary/10 text-primary text-xs will-change-transform"
          >
            <span class="material-symbols-outlined !text-sm"> numbers </span>
            <span>Show quantities in-line</span>
          </button>
        </transition>
      </div>
    </div>
    <div class="flex-1 px-2" v-if="instructions && instructions.length > 0">
      <div class="max-w-2xl">
        <div
          v-for="(instruction, index) in instructions"
          :key="index"
          class="flex gap-5 px-2 md:px-5 py-5 items-start"
        >
          <div
            class="min-w-9 h-9 p-1 rounded-full flex items-center text-xl font-bold border-2 justify-center bg-primary text-white flex-shrink-0 mt-1"
          >
            {{ index + 1 }}
          </div>

          <div class="flex-1 min-w-0">
            <p class="leading-relaxed">
              {{ instruction }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="flex-1 flex items-center justify-center p-6 pb-32">
      <div class="text-center max-w-sm">
        <div
          class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center"
        >
          <span class="material-symbols-outlined text-2xl text-gray-400"
            >menu_book</span
          >
        </div>
        <h3 class="text-lg font-medium text-gray-700 mb-2">
          No Instructions Available
        </h3>
        <p class="text-sm text-gray-500">
          Step-by-step instructions for this recipe haven't been added yet.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ instructions?: string[]; hideHeader: Boolean }>();
</script>

<style scoped></style>
