<template>
  <div class="w-full mt-10 md:px-10">
    <h1 class="text-3xl font-bold text-gray-900">
      Tired of scattered Recipes?
    </h1>
    <p class="text-gray-600">Import your recipes from any link here.</p>

    <div class="flex gap-4 flex-col md:flex-row mt-6">
      <div class="flex-1">
        <div class="relative">
          <span
            class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 material-symbols-outlined"
          >
            link
          </span>
          <input
            v-model="link"
            type="text"
            placeholder="www.yourrecipe.com"
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none transition-colors"
          />
        </div>
      </div>
      <button
        @click="submit(link)"
        :disabled="!link"
        class="px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-white bg-primary rounded-lg font-bold"
      >
        Import
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  submit: (link: string) => void;
}>();
const link = ref('');
</script>

<style scoped></style>
