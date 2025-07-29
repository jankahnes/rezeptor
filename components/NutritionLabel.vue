<template>
  <div class="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
    <div class="flex flex-col text-center gap-4">
      <div class="justify-center">
        <h2 class="text-2xl lg:text-4xl font-bold text-gray-800">
          Nutrition Facts
        </h2>
        <p class="text-sm font-light">Per Serving</p>
      </div>
      <div class="flex justify-center text-2xl font-semibold py-2">
        <div class="p-1 px-4 border-4 border-double border-gray-400 rounded-lg">
          {{ recipe?.kcal }} kcal
        </div>
      </div>
      <div class="flex flex-col gap-2">
        <div
          v-for="item in nutritionalItems"
          :key="item.key"
          class="flex justify-between py-[6px] border-b-2 border-gray-100 border-dashed"
        >
          <span :class="{ 'ml-6': item.indented }">
            <span class="sm:hidden">{{
              typeof item.label === 'object' ? item.label.sm : item.label
            }}</span>
            <span class="hidden sm:inline">{{
              typeof item.label === 'object' ? item.label.default : item.label
            }}</span>
          </span>
          <span class="font-semibold p-1 px-2 bg-primary-20 rounded-lg">{{ recipe?.[item.key]?.toFixed(1) }}g</span>
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

const nutritionalItems: NutritionalItem[] = [
  { key: 'carbohydrates', label: 'Carbs' },
  { key: 'sugar', label: 'Sugar', indented: true },
  { key: 'protein', label: 'Protein' },
  { key: 'fat', label: 'Fat' },
  {
    key: 'saturated_fat',
    label: { sm: 'Sat. Fat', default: 'Saturated Fat' },
    indented: true,
  },
  { key: 'fiber', label: 'Fiber' },
  { key: 'salt', label: 'Sodium' },
];
</script>
<style scoped></style>
