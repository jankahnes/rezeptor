<template>
  <div
    class="grid grid-cols-[4fr_1fr] sm:grid-cols-[6fr_2fr] rounded-lg shadow-main w-full sm:max-w-[600px] font-sans"
  >
    <div class="flex flex-col text-center">
      <div
        class="p-4 border-b-2 border-gray-300 border-dashed justify-center"
      >
        <h2 class="text-xl xs:text-3xl font-bold">Nutritional Information</h2>
        <p class="text-sm font-light">Per Serving</p>
      </div>
      <div class="flex justify-center text-2xl font-semibold py-4">
        <div class="p-1 px-4 border-4 border-double border-gray-400 rounded-lg">
          {{ recipe?.kcal }} kcal
        </div>
      </div>
      <div
        v-for="item in nutritionalItems"
        :key="item.key"
        class="flex justify-between w-full max-w-[300px] mx-auto border-b-2 border-gray-300 border-dashed p-2"
      >
        <span :class="{ 'ml-6': item.indented }">
          <span class="sm:hidden">{{
            typeof item.label === 'object' ? item.label.sm : item.label
          }}</span>
          <span class="hidden sm:inline">{{
            typeof item.label === 'object' ? item.label.default : item.label
          }}</span>
        </span>
        <span>{{ recipe?.[item.key]?.toFixed(1) }}g</span>
      </div>
    </div>
    <div class="flex flex-col">
      <div
        class="text-6xl font-bold flex justify-center items-center aspect-square border-l-2 border-b-2 border-gray-300 border-dashed rounded-r-lg"
        :class="gradeColors[getGrade(recipe?.hidx, 'hidx')]"
      >
        {{ getGrade(recipe?.hidx, 'hidx') }}
      </div>
      <div
        v-for="(item, index) in gradeItems"
        :key="item.key"
        class="flex items-center border-l-2 border-gray-300 border-dashed w-full"
        :class="{ 'border-b-2': index !== gradeItems.length - 1}"
      >
        <div class="flex-1 p-2 text-sm">{{ item.label }}</div>
        <div
          :class="[
            'w-10 h-10 p-2 flex items-center justify-center text-xl font-bold border-gray-300 border-l-2 border-dashed ',
            gradeColors[getGrade(recipe?.[item.key], 'score')],
          ]"
        >
          {{ getGrade(recipe?.[item.key], 'score') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface NutritionalItem {
  key: string;
  label: string | { sm: string; default: string };
  indented?: boolean;
}

interface GradeItem {
  key: string;
  label: string;
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
  { key: 'salt', label: 'Salt' },
];

const gradeItems: GradeItem[] = [
  { key: 'mnidx', label: 'Micronutrients' },
  { key: 'sidx', label: 'Satiety' },
  { key: 'fat_profile_score', label: 'Fat Profile' },
  { key: 'ed', label: 'Energy' },
  { key: 'processing_level_score', label: 'Processing' },
  { key: 'protein_score', label: 'Protein' },
  { key: 'sugar_score', label: 'Sugar' },
  { key: 'fiber_score', label: 'Fiber' },
  { key: 'salt_score', label: 'Sodium' },
];
</script>

<style scoped></style>
