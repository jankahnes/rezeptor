<template>
  <div class="p-2 md:p-6 bg-white rounded-2xl min-w-60">
    <div class="flex flex-col items-start">
      <div class="py-1 px-4 bg-primary text-white rounded-lg flex">
        <h2 class="text-lg font-bold">NUTRITION FACTS</h2>
      </div>
      <p class="text-sm font-light mt-2 text-gray-600 ml-1" v-if="isFood">
        Per 100g
      </p>
      <p class="text-sm font-light mt-2 text-gray-600 ml-1" v-else>
        Per Serving
      </p>
      <div class="px-4 py-2 bg-primary-100 rounded-lg text-xl font-bold mt-4">
        {{ recipe?.kcal }} kcal
      </div>
      <div class="flex flex-wrap gap-4 mt-4">
        <div
          class="px-4 py-2 bg-primary-50 rounded-lg"
          v-for="item in nutritionalItems"
          :key="item.key"
        >
          <p class="text-sm">{{ item.label.toUpperCase() }}</p>
          <p class="font-semibold">{{ recipe?.[item.key]?.toFixed(1) }}g</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface NutritionalItem {
  key: string;
  label: string;
  indented?: boolean;
}

const props = defineProps<{ recipe?: any }>();

const isFood = computed(() => Boolean(props.recipe?.name));

const nutritionalItems: NutritionalItem[] = [
  { key: 'carbohydrates', label: 'Carbs' },
  { key: 'protein', label: 'Protein' },
  { key: 'fat', label: 'Fat' },
  { key: 'sugar', label: 'Sugar' },
  { key: 'saturated_fat', label: 'Saturated Fat' },
  { key: 'fiber', label: 'Fiber' },
  { key: 'salt', label: 'Sodium' },
];
</script>
<style scoped></style>
