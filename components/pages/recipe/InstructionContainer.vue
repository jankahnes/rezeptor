<template>
  <div class="h-full flex flex-col min-w-92">
    <div class="p-6">
      <h2 class="text-xl font-bold text-gray-900">METHOD</h2>
    </div>
    <div
      class="flex-1 pb-6 px-2"
      v-if="instructions && instructions.length > 0"
    >
      <div class="max-w-2xl mx-auto">
        <div
          v-for="(instruction, index) in instructions"
          :key="index"
          class="flex gap-2 p-5"
        >
          <div class="flex-shrink-0">
            <div
              class="w-8 h-8 rounded-full flex items-center text-lg font-bold"
            >
              {{ index + 1 }}
            </div>
          </div>

          <div class="flex-1 min-w-0">
            <p class="text-gray-800 leading-relaxed">
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
defineProps<{ instructions?: string[] }>();
</script>

<style scoped></style>
