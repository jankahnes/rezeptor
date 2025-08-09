<template>
  <div ref="root" class="p-2 md:p-6 bg-white rounded-2xl flex-[1_1_20rem]">
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
      <div class="px-4 py-2 bg-primary/10 rounded-lg text-xl font-bold mt-4">
        {{ recipe?.kcal }} kcal
      </div>

      <div class="flex flex-wrap gap-4 mt-4">
        <div
          class="px-4 py-2 bg-primary/5 rounded-lg"
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
const root = ref<HTMLElement | null>(null);

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

function scrollIntoView() {
  root.value?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

defineExpose({ scrollIntoView });
</script>
<style scoped></style>
