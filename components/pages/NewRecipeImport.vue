<template>
  <div class="mx-auto max-w-screen-md p-6">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">
        Tired of scattered Recipes?
      </h1>
      <p class="text-gray-600 mt-2">Import your recipes from any link here.</p>
    </div>

    <div class="flex gap-4 items-center justify-center flex-col md:flex-row">
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
            class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
        </div>
      </div>
      <button
        @click="submit(link)"
        :disabled="!link"
        class="relative px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ai-gradient"
      >
        Import
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  submit: (link: string) => void;
}>();
const link = ref('');
</script>

<style scoped></style>
