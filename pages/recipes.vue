<template>
  <div>
    <div class="h-[10%] sm:px-12 px-2 py-5 space-y-4 z-10">
      <div
        class="mt-8 sm:mt-0 inline-flex min-w-100 items-center outline outline-gray-300 rounded-lg px-2 gap-2"
      >
        <span class="material-symbols-outlined">search</span>
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search for a recipe"
          class="flex-grow focus:outline-none py-2"
          @keyup.enter="refresh"
          @blur="refresh"
        />
      </div>

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
            @click="onSelect('health')"
            :class="{
              '!bg-primary !text-white': selectedFilter === 'health',
            }"
            class="flex button bg-main p-2 font-bold gap-1 items-center shadow-md"
          >
            <span class="material-symbols-outlined"> health_and_safety </span>
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
            @click="refresh()"
            class="flex button bg-main p-2 font-bold gap-1 items-center shadow-md"
          >
            <span class="material-symbols-outlined">search</span>
          </button>
        </div>
        <div class="flex items-center gap-4">
          <span class="hidden xl:block">Sort by:</span>
          <div class="relative inline-block min-w-45 z-20">
            <FormsDropdown
              v-model="selectedSorting"
              :choices="sorts.map((sort) => sort.displayName)"
            />
          </div>
        </div>
      </div>
      <div v-if="selectedFilter" class="my-2">
        <div class="" v-if="selectedFilter == 'tags'">
          <!-- TODO: Add tag row -->
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
    <div class="my-6 mx-2 sm:mx-6 z-2">
      <div class="flex-wrap gap-4 sm:gap-6 hidden md:flex justify-center">
        <RecipeCard
          :recipe="recipe"
          class="min-w-75 max-w-85 basis-75 min-h-110 text-[32px] flex-1"
          v-for="recipe in results"
          :key="recipe.id"
        />
        <div
          ref="sentinelElement"
          v-if="isLoading || hasMoreRecipes"
          class="min-w-75 max-w-85 basis-75 h-120 text-[32px] flex-1 rounded-xl"
        >
          <Skeleton
            class="min-w-75 max-w-85 basis-75 h-120 text-[32px] flex-1 rounded-xl"
          />
        </div>
        <Skeleton
          v-if="isLoading || hasMoreRecipes"
          v-for="i in 10"
          :key="i"
          class="min-w-75 max-w-85 basis-75 h-120 text-[32px] flex-1 rounded-xl"
        />
      </div>
      <div class="flex flex-col gap-4 md:hidden justify-items-stretch">
        <RecipeCardHorizontal
          :recipe="recipe"
          class=""
          v-for="recipe in results"
          :key="recipe.id"
        />
        <div
          ref="sentinelElementMobile"
          class="w-full"
          v-if="isLoading || hasMoreRecipes"
        >
          <Skeleton class="w-full h-28 xs:h-34 rounded-xl" />
        </div>
        <Skeleton
          v-if="isLoading || hasMoreRecipes"
          class="w-full h-28 xs:h-34 rounded-xl"
          v-for="i in 5"
          :key="i"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient<Database>();
const visibleTags = ref<string[]>([]);
const filteringTags = ref<number[]>([]);
const searchQuery = ref('');
const selectedFilter = ref('');
const results = ref<RecipeOverview[]>([]);

const healthScoreRange = ref<[number, number]>([0, 110]);
const kcalRange = ref<[number, number]>([0, 2500]);
const costRange = ref<[number, number]>([0, 200]);
const selectedSorting = ref('Popularity');
const sorts = ref([
  {
    displayName: 'Popularity',
    value: { column: 'created_at', ascending: false },
  },
  { displayName: 'Rating', value: { column: 'rating', ascending: false } },
  { displayName: 'Cost', value: { column: 'price', ascending: true } },
  { displayName: 'Kcal', value: { column: 'kcal', ascending: true } },
  { displayName: 'Health Score', value: { column: 'hidx', ascending: false } },
  {
    displayName: 'Ingredients (#)',
    value: { column: 'title', ascending: true },
  },
  { displayName: 'Newest', value: { column: 'created_at', ascending: false } },
  { displayName: 'Alphabetical', value: { column: 'title', ascending: true } },
]);

const RECIPES_PER_PAGE = 12;
const currentOffset = ref(0);
const isLoading = ref(false);
const hasMoreRecipes = ref(true);
const sentinelElement = ref<HTMLElement | null>(null);
const sentinelElementMobile = ref<HTMLElement | null>(null);

const filtering = computed(() => {
  const returnFiltering: Filtering = {
    visibility: 'PUBLIC',
    tags: filteringTags.value,
    hidx: healthScoreRange.value,
    kcal: kcalRange.value,
    price: [costRange.value[0] / 10, costRange.value[1] / 10],
  };
  return returnFiltering;
});

async function loadMoreRecipes() {
  if (isLoading.value || !hasMoreRecipes.value) return;
  isLoading.value = true;
  try {
    const newRecipes = await getRecipeOverviews(supabase, {
      orderBy: sorts.value.find(
        (sort) => sort.displayName === selectedSorting.value
      )?.value as { column: string; ascending: boolean },
      not: { picture: null },
      eq: { visibility: 'PUBLIC' },
      filtering: filtering.value,
      trigram_search: { column: 'title', query: searchQuery.value },
      range: {
        from: currentOffset.value,
        to: currentOffset.value + RECIPES_PER_PAGE - 1,
      },
    });

    if (newRecipes.length < RECIPES_PER_PAGE) {
      hasMoreRecipes.value = false;
    }

    results.value = [...results.value, ...newRecipes];
    currentOffset.value += RECIPES_PER_PAGE;
  } catch (error) {
    console.error('Error loading recipes:', error);
  } finally {
    isLoading.value = false;
  }
}

async function refresh() {
  currentOffset.value = 0;
  results.value = [];
  hasMoreRecipes.value = true;
  await loadMoreRecipes();
}

const debouncedRefresh = debounce(refresh, 1000);

watch(filtering, debouncedRefresh, { deep: true });
watch(selectedSorting, refresh);

onMounted(async () => {
  await loadMoreRecipes();
  await nextTick();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !isLoading.value && hasMoreRecipes.value) {
          loadMoreRecipes();
        }
      });
    },
    {
      rootMargin: '100px',
    }
  );

  if (sentinelElement.value) {
    observer.observe(sentinelElement.value);
  }

  if (sentinelElementMobile.value) {
    observer.observe(sentinelElementMobile.value);
  }

  onBeforeUnmount(() => {
    observer.disconnect();
  });
});

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
