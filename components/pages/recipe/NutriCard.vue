<template>
  <div
    class="grid grid-cols-[4fr_1fr] sm:grid-cols-[6fr_2fr] border-2 border-dashed rounded-lg border-gray-300 w-full sm:max-w-[500px] font-sans"
  >
    <div class="flex flex-col text-center">
      <div
        class="flex p-4 text-xl xs:text-3xl font-bold border-b-2 border-gray-300 border-dashed"
      >
        <h2>Nutritional Information</h2>
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
        class="text-6xl font-bold flex justify-center items-center aspect-square border-l-2 border-b-2 border-gray-300 border-dashed"
        :class="gradeColors[recipe?.grade || 'B+']"
      >
        {{ recipe?.grade || 'B+' }}
      </div>
      <div
        v-for="(item, index) in gradeItems"
        :key="item.key"
        class="flex items-center border-l-2 border-gray-300 border-dashed w-full"
        :class="{ 'border-b-2': index !== gradeItems.length - 1 }"
      >
        <div class="flex-1 p-2 text-sm">{{ item.label }}</div>
        <div
          :class="[
            'w-10 h-10 p-2 flex items-center justify-center text-xl font-bold border-gray-300 border-l-2 border-dashed ',
            gradeColors[item.grade],
          ]"
        >
          {{ item.grade }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface NutritionalItem {
  key: keyof Omit<Recipe, 'grade'>;
  label: string | { sm: string; default: string };
  indented?: boolean;
}

interface GradeItem {
  key: string;
  label: string;
  grade:
    | 'S'
    | 'A+'
    | 'A'
    | 'A-'
    | 'B+'
    | 'B'
    | 'B-'
    | 'C+'
    | 'C'
    | 'C-'
    | 'D+'
    | 'D'
    | 'D-'
    | 'E'
    | 'F';
}

const props = defineProps<{ recipe?: Recipe }>();

const gradeColors: Record<GradeItem['grade'], string> = {
  S: 'bg-blue-100 text-blue-800',
  'A+': 'bg-amber-100 text-amber-800',
  A: 'bg-amber-100 text-amber-800',
  'A-': 'bg-amber-100 text-amber-800',
  'B+': 'bg-green-100 text-green-800',
  B: 'bg-green-100 text-green-800',
  'B-': 'bg-green-100 text-green-800',
  'C+': 'bg-yellow-100 text-yellow-800',
  C: 'bg-yellow-100 text-yellow-800',
  'C-': 'bg-yellow-100 text-yellow-800',
  'D+': 'bg-orange-100 text-orange-800',
  D: 'bg-orange-100 text-orange-800',
  'D-': 'bg-orange-100 text-orange-800',
  E: 'bg-red-100 text-red-800',
  F: 'bg-red-200 text-red-900',
};

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
  { key: 'micronutrients', label: 'Micronutrients', grade: 'D' },
  { key: 'satiety', label: 'Satiety', grade: 'A' },
  { key: 'fatProfile', label: 'Fat Profile', grade: 'A' },
  { key: 'energy', label: 'Energy', grade: 'F' },
  { key: 'protein', label: 'Protein', grade: 'A' },
  { key: 'sugar', label: 'Sugar', grade: 'C-' },
  { key: 'fiber', label: 'Fiber', grade: 'A' },
  { key: 'sodium', label: 'Sodium', grade: 'B' },
];
</script>

<style scoped></style>
