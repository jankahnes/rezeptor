<template>
  <div class="h-[10%] sm:px-12 px-2 py-5 space-y-4 z-10">
    <h1 class="hidden md:block text-2xl font-bold text-center sm:text-start">
      All Recipes
    </h1>
    <div
      class="flex justify-center sm:justify-between items-center flex-wrap gap-2"
    >
      <div class="filters flex items-center gap-2">
        <button
          @click="onSelect('tags')"
          :class="{
            '!bg-primary !text-white': selectedFilter === 'tags',
          }"
          class="flex button bg-main p-2 font-bold gap-1 items-center shadow-md"
        >
          <span class="material-symbols-outlined"> sell </span>
          <span class="hidden lg:block">Tags</span>
        </button>
        <button
          @click="onSelect('effort')"
          :class="{
            '!bg-primary !text-white': selectedFilter === 'effort',
          }"
          class="flex button bg-main p-2 font-bold gap-1 items-center shadow-md"
        >
          <Effort class="h-6 w-6" />
          <span class="hidden lg:block">Effort</span>
        </button>
        <button
          @click="onSelect('difficulty')"
          :class="{
            '!bg-primary !text-white': selectedFilter === 'difficulty',
          }"
          class="flex button bg-main p-2 font-bold gap-1 items-center shadow-md"
        >
          <Difficulty class="h-6 w-6" />
          <span class="hidden lg:block">Difficulty</span>
        </button>
        <button
          @click="onSelect('health')"
          :class="{
            '!bg-primary !text-white': selectedFilter === 'health',
          }"
          class="flex button bg-main p-2 font-bold gap-1 items-center shadow-md"
        >
          <Badge class="h-6 w-6" />
          <span class="hidden lg:block">Health Score</span>
        </button>
        <button
          @click="onSelect('kcal')"
          :class="{
            '!bg-primary !text-white': selectedFilter === 'kcal',
          }"
          class="flex button bg-main p-2 font-bold gap-1 items-center shadow-md"
        >
          <span class="material-symbols-outlined"> bolt </span>
          <span class="hidden lg:block">Kcal</span>
        </button>
        <button
          @click="onSelect('cost')"
          :class="{
            '!bg-primary !text-white': selectedFilter === 'cost',
          }"
          class="flex button bg-main p-2 font-bold gap-1 items-center shadow-md"
        >
          <span class="material-symbols-outlined"> euro </span>
          <span class="hidden lg:block">Cost</span>
        </button>
        <button
          @click="search"
          class="flex button bg-main p-2 font-bold gap-1 items-center shadow-md"
        >
          <span class="">Apply</span>
        </button>
      </div>
      <div class="flex items-center gap-4">
        <span class="hidden xl:block">Sort by:</span>
        <div class="relative inline-block min-w-45 z-10">
          <FormsDropdown v-model="selectedSorting" :choices="sorts" />
        </div>
      </div>
    </div>
    <div v-if="selectedFilter" class="my-2">
      <div class="" v-if="selectedFilter == 'tags'">
        <TagRow :click-function="addFilteringTag" />
      </div>
      <div
        class="relative select-none flex gap-2 justify-center sm:justify-start mt-1"
        v-if="selectedFilter == 'effort'"
      >
        <button
          v-for="(effort, index) in effortLevels"
          class="button px-4 py-2 flex items-center justify-center gap-3 whitespace-nowrap"
          :key="effort"
          @click="addTag('Effort: ' + effort)"
        >
          <img src="/effort1.png" v-if="index == 0" class="w-[18px] h-6" />
          <img src="/effort2.png" v-if="index == 1" class="w-6 h-6" />
          <img src="/effort3.png" v-if="index == 2" class="w-[30px] h-6" />
          <span class="hidden sm:block">{{ effort }}</span>
        </button>
      </div>
      <div
        class="relative select-none flex gap-2 justify-center sm:justify-start mt-1"
        v-if="selectedFilter == 'difficulty'"
      >
        <button
          v-for="(difficulty, index) in difficulties"
          class="button px-4 py-2 flex items-center justify-center gap-3 whitespace-nowrap"
          :key="difficulty"
          @click="addTag('Difficulty: ' + difficulty)"
        >
          <img src="/difficulty1.png" v-if="index == 0" class="w-6 h-6" />
          <img src="/difficulty2.png" v-if="index == 1" class="w-7 h-6" />
          <img src="/difficulty3.png" v-if="index == 2" class="w-[34px] h-6" />
          <span class="hidden sm:block">{{ difficulty }}</span>
        </button>
      </div>
      <div
        class="relative py-3 select-none ml-4 mr-6 lg:mx-3"
        v-if="selectedFilter == 'health'"
      >
        <FormsRangeSlider
          v-model="healthScoreRange"
          :min="0"
          :max="100"
          class="max-w-lg"
          :display-map="getGrade"
          :update="updateGradeTag"
        />
      </div>
      <div
        class="relative py-3 select-none ml-4 mr-12 lg:mx-3"
        v-if="selectedFilter == 'kcal'"
      >
        <FormsRangeSlider
          v-model="kcalRange"
          :min="0"
          :max="2500"
          class="max-w-lg"
          :display-map="(value: number) => value"
          :update="updateKcalTag"
        />
      </div>
      <div
        class="relative py-3 select-none ml-4 mr-18 lg:mx-3"
        v-if="selectedFilter == 'cost'"
      >
        <FormsRangeSlider
          v-model="costRange"
          :min="0"
          :max="200"
          class="max-w-lg"
          :display-map="getEuroFormat"
          :update="updateCostTag"
        />
      </div>
    </div>
    <div v-if="visibleTags.length" class="flex gap-2 flex-wrap mt-4">
      <button
        v-for="(tag, index) in visibleTags"
        class="px-3 button flex items-center justify-center gap-2 group !shadow-none"
        @click="removeTag(index)"
      >
        <span
          class="material-symbols-outlined !text-base group-hover:!font-bold"
        >
          close
        </span>
        <span>{{ tag }}</span>
      </button>
    </div>
  </div>
  <div class="my-6 mx-4 sm:mx-6 z-2">
    <div
      class="flex flex-wrap gap-6 md:justify-start justify-center"
      v-if="!pending"
    >
      <RecipeCard
        :recipe="recipe"
        class="flex-1 max-w-100 min-w-80 basis-80 text-[28px] h-120 sm:max-w-90 sm:min-w-80 sm:h-130 sm:text-[34px] sm:basis-80"
        v-for="recipe in results"
      />
    </div>
    <div class="flex flex-wrap gap-6 md:justify-start justify-center" v-else>
      <Skeleton
        class="flex-1 max-w-100 min-w-80 basis-80 text-[26px] h-120 sm:max-w-90 sm:min-w-80 sm:h-130 sm:text-[34px] sm:basis-80 rounded-xl"
        v-for="i in 10"
        :key="i"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import Difficulty from '@/assets/icons/difficulty.svg';
import Effort from '@/assets/icons/effort.svg';
import Badge from '@/assets/icons/badge.svg';

const visibleTags = ref<string[]>([]);
const filteringTags = ref<number[]>([]);
const difficulties = ['Easy', 'Medium', 'Hard'];
const effortLevels = ['Light', 'Moderate', 'Heavy'];
const selectedFilter = ref('');
const results = ref<RecipeProcessed[]>([]);

const healthScoreRange = ref<[number, number]>([0, 100]);
const kcalRange = ref<[number, number]>([0, 2500]);
const costRange = ref<[number, number]>([0, 200]);
const selectedSorting = ref('Popularity');
const sorts = ref([
  'Popularity',
  'Rating',
  'Cost',
  'Kcal',
  'Ingredients (#)',
  'Newest',
  'Alphabetical',
]);

const searchKey = ref(0);

const filtering = computed(() => {
  const returnFiltering: Filtering = {
    difficulties: ['EASY', 'MEDIUM', 'HARD'],
    efforts: ['LIGHT', 'MODERATE', 'HEAVY'],
    visibility: 'PUBLIC',
    tags: filteringTags.value,
    hidx: healthScoreRange.value,
    kcal: kcalRange.value,
    price: [costRange.value[0] / 10, costRange.value[1] / 10],
    title: '',
  };
  for (const tag of visibleTags.value) {
    if (tag.startsWith('Difficulty')) {
      if (returnFiltering.difficulties?.length == 3) {
        returnFiltering.difficulties = [];
      }
      returnFiltering.difficulties?.push(tag.split(' ')[1].toUpperCase());
    }
    if (tag.startsWith('Effort')) {
      if (returnFiltering.efforts?.length == 3) {
        returnFiltering.efforts = [];
      }
      returnFiltering.efforts?.push(tag.split(' ')[1].toUpperCase());
    }
  }
  return returnFiltering;
});

const { data, pending, refresh } = await useRecipesPartial(
  () => ({
    orderBy: { column: 'created_at', ascending: false },
    not: { picture: null },
    eq: { visibility: 'PUBLIC' },
    filtering: filtering.value,
  }),
  searchKey.value.toString()
);

watchEffect(() => {
  if (data.value) {
    results.value = data.value as RecipeProcessed[];
  }
});

async function search() {
  searchKey.value++;
  await refresh();
}

function getEuroFormat(num: number): string {
  if (num < 10) {
    return num * 10 + 'ct';
  } else {
    if (num % 10 != 0) {
      return num / 10 + '0€';
    }
    return num / 10 + '.00€';
  }
}

function removeTag(index: number) {
  const tagName = visibleTags.value[index];
  if (tagName.startsWith('Health Score')) {
    healthScoreRange.value = [0, 100];
  } else if (tagName.startsWith('Kcal')) {
    kcalRange.value = [0, 2500];
  } else if (tagName.startsWith('Cost')) {
    costRange.value = [0, 200];
  }
  filteringTags.value = filteringTags.value.filter(
    (tag) => getTagByID(tag)?.name !== tagName
  );
  visibleTags.value.splice(index, 1);
}

function addTag(tag: string) {
  if (!visibleTags.value.includes(tag)) {
    visibleTags.value.push(tag);
  }
}

function addFilteringTag(tag: { id: number; name: string }) {
  addTag(tag.name);
  filteringTags.value.push(tag.id);
}

function updateGradeTag(min: number, max: number) {
  const filtered = visibleTags.value.filter(
    (item) => !item.startsWith('Health Score')
  );
  if (min != 0 || max != 100) {
    filtered.push('Health Score: ' + getGrade(min) + ' ⟶ ' + getGrade(max));
  }
  visibleTags.value = filtered;
}

function updateKcalTag(min: number, max: number) {
  const filtered = visibleTags.value.filter((item) => !item.startsWith('Kcal'));
  if (min != 0 || max != 2500) {
    filtered.push('Kcal: ' + min + ' ⟶ ' + max);
  }
  visibleTags.value = filtered;
}

function updateCostTag(min: number, max: number) {
  const filtered = visibleTags.value.filter((item) => !item.startsWith('Cost'));
  if (min != 0 || max != 2000) {
    filtered.push('Cost: ' + getEuroFormat(min) + ' ⟶ ' + getEuroFormat(max));
  }
  visibleTags.value = filtered;
}

async function onSelect(button: string) {
  if (button == selectedFilter.value) {
    selectedFilter.value = '';
  } else {
    selectedFilter.value = button;
  }
}
</script>

<style scoped></style>
