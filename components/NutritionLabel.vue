<template>
  <div ref="root" class="p-2 md:p-6 bg-white rounded-2xl flex-[1_1_20rem]">
    <div class="flex flex-col items-start">
      <div class="py-1 px-4 bg-primary text-white rounded-lg flex">
        <h2 class="text-lg font-bold">NUTRITION INFO</h2>
      </div>
      <p
        class="text-sm font-light mt-2 text-gray-600 ml-1 cursor-pointer hover:underline select-none"
        v-if="mode === '100g'"
        @click="switchMode"
      >
        Per 100g
      </p>
      <p
        class="text-sm font-light mt-2 text-gray-600 ml-1 cursor-pointer hover:underline select-none"
        v-else-if="mode === 'serving'"
        @click="switchMode"
      >
        Per Serving
      </p>
      <div class="px-4 py-2 bg-primary-50 rounded-lg text-xl font-bold mt-4">
        {{
          (mode === 'serving'
            ? recipe?.kcal
            : (recipe?.kcal * 100) / totalWeight
          )?.toFixed(0)
        }}
        kcal
      </div>

      <div class="flex flex-col gap-x-4 mt-4 w-full">
        <div
          class="grid gap-4 w-full"
          :class="getGridClass(row)"
          v-for="row in rows"
        >
          <div
            v-for="item in row"
            :key="item.key"
            :class="getItemClass(item, row)"
          >
            <template v-if="item.key === 'connector'">
              <div class="relative h-4 w-full">
                <div
                  class="absolute h-full bg-gradient-to-b from-primary-50/80 to-primary-50/60 top-0 left-[calc((100%-2rem)/6)] w-[8px] pillar-clip-path"
                ></div>
                <div
                  class="absolute h-full bg-gradient-to-b from-primary-50/80 to-primary-50/60 top-0 right-[calc((100%-2rem)/6)] w-[8px] pillar-clip-path"
                ></div>
              </div>
            </template>
            <template v-else-if="item.key === 'spacer'">
              <div class="h-4"></div>
            </template>
            <template v-else>
              <p class="text-xs">{{ item.label.toUpperCase() }}</p>
              <p class="font-semibold" v-if="mode === 'serving'">
                {{ recipe?.[item.key]?.toFixed(1) }}g
              </p>
              <p class="font-semibold" v-else>
                {{ ((recipe?.[item.key] * 100) / totalWeight)?.toFixed(1) }}g
              </p>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface NutritionalItem {
  key: string;
  label: string;
}

const props = defineProps<{ recipe?: any }>();
const root = ref<HTMLElement | null>(null);

const isFood = computed(() => Boolean(props.recipe?.name));
const mode = ref(isFood.value ? '100g' : 'serving');
const totalWeight = props.recipe?.total_weight || 100;

const switchMode = () => {
  if (isFood.value || !totalWeight) {
    return;
  }
  mode.value = mode.value === '100g' ? 'serving' : '100g';
};

const nutritionalItems: NutritionalItem[] = [
  { key: 'carbohydrates', label: 'Carbs' },
  { key: 'protein', label: 'Protein' },
  { key: 'fat', label: 'Fat' },
  { key: 'connector', label: '' },
  { key: 'sugar', label: 'Sugar' },
  { key: 'saturated_fat', label: 'Saturated Fat' },
  { key: 'spacer', label: '' },
  { key: 'fiber', label: 'Fiber' },
  { key: 'salt', label: 'Sodium' },
];

const rows = [
  nutritionalItems.slice(0, 3),
  nutritionalItems.slice(3, 4),
  nutritionalItems.slice(4, 6),
  nutritionalItems.slice(6, 7),
  nutritionalItems.slice(7, 9),
];

function getGridClass(row: NutritionalItem[]) {
  if (row.length === 3) return 'grid-cols-3';
  if (row.length === 2) return 'grid-cols-2';
  return 'grid-cols-1';
}

function getItemClass(item: NutritionalItem, row: NutritionalItem[]) {
  if (item.key === 'connector' || item.key === 'spacer') {
    return 'col-span-full';
  }
  if (['carbohydrates', 'protein', 'fat'].includes(item.key)) {
    return 'px-4 py-2 bg-primary-50/80 rounded-lg';
  } else if (['sugar', 'saturated_fat'].includes(item.key)) {
    return 'px-4 py-2 bg-primary-50/60 rounded-lg';
  }
  return 'px-4 py-2 bg-primary-50/40 rounded-lg';
}

function scrollIntoView() {
  root.value?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

defineExpose({ scrollIntoView });
</script>
<style scoped>
.pillar-clip-path {
  clip-path: polygon(
    100% 0%,
    80% 25%,
    75% 50%,
    80% 75%,
    85% 100%,
    15% 100%,
    20% 75%,
    25% 50%,
    20% 25%,
    0% 0%
  );
}
</style>
