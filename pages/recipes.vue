<template>
  <div
    class="sticky top-18 xm:top-22 bg-[#fffefcb] w-full h-[10%] sm:px-12 px-2 py-5 space-y-4 z-10"
  >
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
            '!bg-black !text-white !border-black': selectedFilter === 'tags',
          }"
          class="flex bg-white border-2 p-2 font-bold shadow-[2px_2px_0_0_rgba(0,0,0,1)] gap-1 items-center"
        >
          <span class="material-symbols-outlined"> sell </span>
          <span class="hidden lg:block">Tags</span>
        </button>
        <button
          @click="onSelect('effort')"
          :class="{
            '!bg-black !text-white !border-black': selectedFilter === 'effort',
          }"
          class="flex bg-white border-2 p-2 font-bold shadow-[2px_2px_0_0_rgba(0,0,0,1)] gap-1 items-center"
        >
          <Effort class="h-6 w-6" />
          <span class="hidden lg:block">Effort</span>
        </button>
        <button
          @click="onSelect('difficulty')"
          :class="{
            '!bg-black !text-white !border-black':
              selectedFilter === 'difficulty',
          }"
          class="flex bg-white border-2 p-2 font-bold shadow-[2px_2px_0_0_rgba(0,0,0,1)] gap-1 items-center"
        >
          <Difficulty class="h-6 w-6" />
          <span class="hidden lg:block">Difficulty</span>
        </button>
        <button
          @click="onSelect('health')"
          :class="{
            '!bg-black !text-white !border-black': selectedFilter === 'health',
          }"
          class="flex bg-white border-2 p-2 font-bold shadow-[2px_2px_0_0_rgba(0,0,0,1)] gap-1 items-center"
        >
          <Badge class="h-6 w-6" />
          <span class="hidden lg:block">Health Score</span>
        </button>
        <button
          @click="onSelect('kcal')"
          :class="{
            '!bg-black !text-white !border-black': selectedFilter === 'kcal',
          }"
          class="flex bg-white border-2 p-2 font-bold shadow-[2px_2px_0_0_rgba(0,0,0,1)] gap-1 items-center"
        >
          <span class="material-symbols-outlined"> bolt </span>
          <span class="hidden lg:block">Kcal</span>
        </button>
        <button
          @click="onSelect('cost')"
          :class="{
            '!bg-black !text-white !border-black': selectedFilter === 'cost',
          }"
          class="flex bg-white border-2 p-2 font-bold shadow-[2px_2px_0_0_rgba(0,0,0,1)] gap-1 items-center"
        >
          <span class="material-symbols-outlined"> euro </span>
          <span class="hidden lg:block">Cost (Serving)</span>
        </button>
        <button
          @click="search"
          class="flex bg-white border-2 p-2 font-bold shadow-[2px_2px_0_0_rgba(0,0,0,1)] gap-1 items-center"
        >
          <span class="">Apply</span>
        </button>
      </div>
      <div class="flex items-center gap-4">
        <span class="hidden xl:block">Sort by:</span>
        <div class="relative inline-block min-w-45">
          <FormsDropdown
            v-model="selectedSorting"
            :choices="sorts"
            :thin="false"
          ></FormsDropdown>
        </div>
      </div>
    </div>
    <div v-if="selectedFilter">
      <div class="" v-if="selectedFilter == 'tags'">
        <TagRow :click-function="addFilteringTag" />
      </div>
      <div
        class="relative select-none flex gap-2 justify-center sm:justify-start py-[3px]"
        v-if="selectedFilter == 'effort'"
      >
        <button
          v-for="(effort, index) in effortLevels"
          class="px-4 py-1 rounded-xl border flex items-center justify-center gap-2 group hover:outline whitespace-nowrap"
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
        class="relative select-none flex gap-2 justify-center sm:justify-start py-[3px]"
        v-if="selectedFilter == 'difficulty'"
      >
        <button
          v-for="(difficulty, index) in difficulties"
          class="px-4 py-1 rounded-xl border flex items-center justify-center gap-2 group hover:outline whitespace-nowrap"
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
        class="relative py-3 select-none ml-3 mr-5 lg:mx-3"
        v-if="selectedFilter == 'health'"
      >
        <FormsRangeSlider
          v-model="healthScoreRange"
          :min="0"
          :max="12"
          class="max-w-lg"
          :display-map="getGradeFormat"
          :update="updateGradeTag"
        />
      </div>
      <div
        class="relative py-3 select-none ml-3 mr-10 lg:mx-3"
        v-if="selectedFilter == 'kcal'"
      >
        <FormsRangeSlider
          v-model="kcalRange"
          :min="10"
          :max="2500"
          class="max-w-lg"
          :display-map="(value: number) => value"
          :update="updateKcalTag"
        />
      </div>
      <div
        class="relative py-3 select-none ml-3 mr-15 lg:mx-3"
        v-if="selectedFilter == 'cost'"
      >
        <FormsRangeSlider
          v-model="costRange"
          :min="1"
          :max="200"
          class="max-w-lg"
          :display-map="getEuroFormat"
          :update="updateCostTag"
        />
      </div>
    </div>
    <div v-if="visibleTags.length > 0" class="flex gap-2 flex-wrap">
      <button
        v-for="(tag, index) in visibleTags"
        class="px-3 rounded-xl border flex items-center justify-center gap-2 group"
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
  <div
    class="mx-auto mt-6 sm:m-6 sm:mt-0 grid xs:gap-6 sm:grid-cols-[repeat(auto-fit,minmax(30rem,1fr))] grid-cols-[repeat(auto-fit,minmax(20rem,1fr))]"
  >
    <div
      class="flex flex-col justify-center items-center"
      v-for="recipe in results"
    >
      <RecipeCard :recipe="recipe" />
      <div
        class="xs:hidden mt-6 mb-4 w-75 h-[1px] border-b-1 border-dashed"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Difficulty from '@/assets/icons/difficulty.svg';
import Effort from '@/assets/icons/effort.svg';
import Badge from '@/assets/icons/badge.svg';

const visibleTags = ref([]);
const supabase = useSupabase();
const filteringTags = ref([]);
const difficulties = ['Easy', 'Medium', 'Hard'];
const effortLevels = ['Light', 'Moderate', 'Heavy'];
const selectedFilter = ref('');
const results = ref([]);

const healthScoreRange = ref<[number, number]>([0, 12]);
const kcalRange = ref<[number, number]>([10, 2500]);
const costRange = ref<[number, number]>([1, 200]);
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

type Filtering = {
  title: string;
  difficulties: string[];
  efforts: string[];
  visibility: 'PUBLIC' | 'PRIVATE' | 'UNLISTED';
  tags: number[];
  hidx: [number, number];
  kcal: [number, number];
  price: [number, number];
  sorting: string;
  sortingOrder: 'asc' | 'desc';
};

function parseTags() {
  const filtering: Filtering = {
    difficulties: ['EASY', 'MEDIUM', 'HARD'],
    efforts: ['LIGHT', 'MODERATE', 'HEAVY'],
    visibility: 'PUBLIC',
    tags: filteringTags.value,
    hidx: [0, 100],
    kcal: kcalRange.value,
    price: [costRange.value[0] / 10, costRange.value[1] / 10],
    sorting: 'created_at',
    sortingOrder: 'desc',
    title: '',
  };
  for (const tag of visibleTags.value) {
    if (tag.startsWith('Difficulty')) {
      if (filtering.difficulties.length == 3) {
        filtering.difficulties = [];
      }
      filtering.difficulties.push(tag.split(' '));
    }
    if (tag.startsWith('Effort')) {
      if (filtering.efforts.length == 3) {
        filtering.efforts = [];
      }
      filtering.efforts.push(tag.split(' '));
    }
  }
  return filtering;
}

async function search() {
  const filtering = parseTags();
  results.value = await getResults(filtering);
  for (const result of results.value) {
    result.tags = [];
    for (const tag of result.recipe_tags) {
      result.tags.push(tag.tag_id);
    }
  }
  for (const result of results.value) {
    if (result.picture_ext) {
      const { data: publicUrlData } = supabase.storage
        .from('recipe')
        .getPublicUrl(`${result.id}.${result.picture_ext}`);

      result.imageUrl = publicUrlData.publicUrl;
    }
  }
}

async function getResults(filtering: Filtering) {
  // --- 1) Base query: select all columns from recipes
  let query = supabase.from('recipes').select(`
      *,
      recipe_tags!inner (
        tag_id,
        tags ( id, name )
      )
    `);

  // --- 2) Title search using pg_trgm similarity
  //    skip if empty string
  if (filtering.title.trim() !== '') {
    // NOTE: you must have pg_trgm & a similarity index on title
    // here we use `.textSearch` + a threshold filter as a pattern;
    // you could also wrap this in a custom RPC if you prefer.
    query = query
      .textSearch('title', filtering.title, {
        config: 'english',
        type: 'plain',
      })
      .gt('similarity', 0.3);
  }

  // --- 3) Effort & difficulty: pick 1–3 enum values
  if (filtering.efforts.length > 0) {
    query = query.in('effort', filtering.efforts);
  }
  if (filtering.difficulties.length > 0) {
    query = query.in('difficulty', filtering.difficulties);
  }

  // --- 4) Visibility enum
  if (filtering.visibility) {
    query = query.eq('visibility', filtering.visibility);
  }

  // --- 5) Tag filtering (via the join)
  //    only keep recipes that have at least one of the selected tags
  if (filtering.tags.length > 0) {
    query = query.in('recipe_tags.tag_id', filtering.tags);
  }

  // --- 6) Ranges: hidx, kcal, price
  const [[hmin, hmax], [kmin, kmax], [pmin, pmax]] = [
    filtering.hidx,
    filtering.kcal,
    filtering.price,
  ];

  query = query
    .gte('hidx', hmin)
    .lte('hidx', hmax)
    .gte('kcal', kmin)
    .lte('kcal', kmax)
    .gte('price', pmin)
    .lte('price', pmax);

  // --- 7) Sorting
  query = query.order(filtering.sorting, {
    ascending: filtering.sortingOrder === 'asc',
  });

  // --- 8) Execute
  const { data, error } = await query.limit(20);

  if (error) {
    console.error('Error fetching recipes:', error);
    return [];
  }
  console.log(data);
  return data;
}

function getGradeFormat(index: number): string {
  const grades = [
    'F',
    'D-',
    'D',
    'D+',
    'C-',
    'C',
    'C+',
    'B-',
    'B',
    'B+',
    'A-',
    'A',
    'A+',
  ];

  if (index < 0 || index >= grades.length) {
    throw new RangeError('Index must be between 0 and 12.');
  }
  return grades[index];
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
    healthScoreRange.value = [0, 12];
  } else if (tagName.startsWith('Kcal')) {
    kcalRange.value = [10, 2500];
  } else if (tagName.startsWith('Cost')) {
    costRange.value = [1, 200];
  }
  filteringTags.value = filteringTags.value.filter(
    (tag) => getTagByID(tag).name !== tagName
  );
  visibleTags.value.splice(index, 1);
}

function addTag(tag: string) {
  if (!visibleTags.value.includes(tag)) {
    visibleTags.value.push(tag);
  }
}

function addFilteringTag(tag: Object) {
  addTag(tag.name);
  filteringTags.value.push(tag.id);
}

function updateGradeTag(min: number, max: number) {
  const filtered = visibleTags.value.filter(
    (item) => !item.startsWith('Health Score')
  );
  if (min != 0 || max != 12) {
    filtered.push(
      'Health Score: ' + getGradeFormat(min) + ' ⟶ ' + getGradeFormat(max)
    );
  }
  visibleTags.value = filtered;
}

function updateKcalTag(min: number, max: number) {
  const filtered = visibleTags.value.filter((item) => !item.startsWith('Kcal'));
  if (min != 10 || max != 2500) {
    filtered.push('Kcal: ' + min + ' ⟶ ' + max);
  }
  visibleTags.value = filtered;
}

function updateCostTag(min: number, max: number) {
  const filtered = visibleTags.value.filter((item) => !item.startsWith('Cost'));
  if (min != 10 || max != 2000) {
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

onMounted(() => {
  search();
});
</script>

<style scoped></style>
