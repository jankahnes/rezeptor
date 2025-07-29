<template>
  <div class="mx-auto max-w-screen-md p-6">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">
        Can't find a generic food?
      </h1>
      <p class="text-gray-600 mt-2">
        Request it here and we'll add it to the database.
      </p>
    </div>

    <div class="bg-white rounded-2xl shadow-main p-4 sm:p-8 space-y-8">
      <div class="flex gap-4 items-center justify-center flex-col md:flex-row">
        <div class="flex-1">
          <div class="relative">
            <span
              class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 material-symbols-outlined"
            >
              grocery
            </span>
            <input
              v-model="foodName"
              type="text"
              placeholder="Enter food name..."
              class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>
        </div>
        <button
          @click="requestFood()"
          :disabled="!foodName"
          class="relative px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ai-gradient"
        >
          Request
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const foodName = ref('');

const requestFood = () => {
  console.log(foodName.value);
}


</script>

<style scoped>
</style>
