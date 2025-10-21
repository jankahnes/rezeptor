<template>
  <div>
    <div class="h-[10%] sm:px-12 px-2 py-5 space-y-4 z-10">
      <div class="flex justify-between items-end gap-6">
        <div
          class="mt-8 sm:mt-0 inline-flex min-w-0 w-100 items-center outline outline-gray-300 rounded-lg px-2 gap-2 justify-between"
        >
          <span class="material-symbols-outlined">search</span>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search for a recipe"
            class="flex-grow focus:outline-none py-2"
            @keyup.enter="() => refresh(true)"
            @blur="handleSearchBlur"
          />
        </div>
        <span class="text-gray-500 text-sm text-nowrap"
          >{{ totalCount }} Results</span
        >
      </div>

      <div class="flex justify-between items-center flex-wrap gap-2">
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
        </div>
        <div class="flex items-center gap-4">
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
          <!-- Categories -->
          <div class="py-1">
            <Carousel>
              <div
                v-for="category in categories"
                :key="category.tag"
                @click="toggleTag(category)"
                :class="{
                  '!bg-primary !text-white': filteringTags.includes(
                    category.tag
                  ),
                }"
                class="flex flex-col sm:flex-row items-center gap-x-1 px-2 py-1 transition-all duration-300 flex-shrink-0 button m-1"
              >
                <span class="text-2xl">{{ category.icon }}</span>
                <span
                  class="text-sm sm:text-base sm:tracking-wider text-nowrap"
                  >{{ category.name }}</span
                >
              </div>
            </Carousel>
          </div>

          <!-- Cuisines -->
          <div class="py-1">
            <Carousel>
              <div
                v-for="cuisine in cuisines"
                :key="cuisine.tag"
                @click="toggleTag(cuisine)"
                :class="{
                  '!bg-primary !text-white': filteringTags.includes(
                    cuisine.tag
                  ),
                }"
                class="flex flex-col sm:flex-row items-center gap-x-1 px-2 py-1 transition-all duration-300 flex-shrink-0 button m-1"
              >
                <span class="text-xl">{{ cuisine.icon }}</span>
                <span
                  class="text-sm sm:text-base sm:tracking-wider text-nowrap"
                  >{{ cuisine.name }}</span
                >
              </div>
            </Carousel>
          </div>
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
const route = useRoute();
const router = useRouter();

const visibleTags = ref<string[]>([]);
const filteringTags = ref<number[]>([]);
const searchQuery = ref('');
const lastSearchedQuery = ref('');
const selectedFilter = ref('');
const results = ref<RecipeOverview[]>([]);

const healthScoreRange = ref<[number, number]>([0, 110]);
const kcalRange = ref<[number, number]>([0, 2500]);
const costRange = ref<[number, number]>([0, 200]);

const healthScoreIsAtDefault = computed(() => {
  return healthScoreRange.value[0] == 0 && healthScoreRange.value[1] == 110;
});

const kcalIsAtDefault = computed(() => {
  return kcalRange.value[0] == 0 && kcalRange.value[1] == 2500;
});

const costIsAtDefault = computed(() => {
  return costRange.value[0] == 0 && costRange.value[1] == 200;
});

const categories = ref([
  { name: 'Breakfast', icon: '🥐', tag: 201 },
  { name: 'Lunch', icon: '🍔', tag: 205 },
  { name: 'Dinner', icon: '🍝', tag: 200 },
  { name: 'Snacks', icon: '🍟', tag: 203 },
  { name: 'Dessert', icon: '🍰', tag: 204 },
  { name: 'Quick and Easy', icon: '⚡', tag: 3 },
  { name: 'Healthy', icon: '🏵️', tag: 100 },
  { name: 'Budget', icon: '💰', tag: 4 },
  { name: 'Meal Prep', icon: '🍱', tag: 5 },
]);

const cuisines = ref([
  { name: 'Italian', icon: '🇮🇹', tag: 302 },
  { name: 'German', icon: '🇩🇪', tag: 303 },
  { name: 'American', icon: '🇺🇸', tag: 304 },
  { name: 'Vietnamese', icon: '🇻🇳', tag: 305 },
  { name: 'Chinese', icon: '🇨🇳', tag: 306 },
  { name: 'Japanese', icon: '🇯🇵', tag: 307 },
  { name: 'French', icon: '🇫🇷', tag: 308 },
  { name: 'British', icon: '🇬🇧', tag: 309 },
  { name: 'Indian', icon: '🇮🇳', tag: 310 },
  { name: 'Spanish', icon: '🇪🇸', tag: 311 },
  { name: 'Middle Eastern', icon: '🌍', tag: 312 },
  { name: 'Thai', icon: '🇹🇭', tag: 313 },
  { name: 'Mediterranean', icon: '🌊', tag: 314 },
  { name: 'Greek', icon: '🇬🇷', tag: 315 },
  { name: 'Turkish', icon: '🇹🇷', tag: 316 },
  { name: 'Korean', icon: '🇰🇷', tag: 321 },
  { name: 'Mexican', icon: '🇲🇽', tag: 326 },
]);

const selectedSorting = ref('Popularity');
const sorts = ref([
  {
    displayName: 'Popularity',
    value: { column: 'relevancy', ascending: false },
  },
  { displayName: 'Rating', value: { column: 'rating', ascending: false } },
  { displayName: 'Health Score', value: { column: 'hidx', ascending: false } },
  { displayName: 'Newest', value: { column: 'created_at', ascending: false } },
]);

const RECIPES_PER_PAGE = 12;
const currentOffset = ref(0);
const isLoading = ref(false);
const hasMoreRecipes = ref(true);
const totalCount = ref<number | null>(null);
const sentinelElement = ref<HTMLElement | null>(null);
const sentinelElementMobile = ref<HTMLElement | null>(null);
const isInitialLoad = ref(true);

const filtering = computed(() => {
  const returnFiltering: Filtering = {
    visibility: 'PUBLIC',
    tags: filteringTags.value,
    hidx: healthScoreIsAtDefault.value ? null : healthScoreRange.value,
    kcal: kcalIsAtDefault.value ? null : kcalRange.value,
    price: costIsAtDefault.value
      ? null
      : [costRange.value[0] / 10, costRange.value[1] / 10],
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

    // @ts-ignore - TypeScript inference issue with deeply nested types
    results.value = [...results.value, ...newRecipes];
    currentOffset.value += RECIPES_PER_PAGE;
  } catch (error) {
    console.error('Error loading recipes:', error);
  } finally {
    isLoading.value = false;
  }
}

async function refresh(shouldRecount = true) {
  currentOffset.value = 0;
  results.value = [];
  hasMoreRecipes.value = true;
  lastSearchedQuery.value = searchQuery.value;

  if (shouldRecount) {
    getCount(supabase, {
      not: { picture: null },
      eq: { visibility: 'PUBLIC' },
      filtering: filtering.value,
    }).then((count) => {
      totalCount.value = count;
    });
  }
  await loadMoreRecipes();
}

function handleSearchBlur() {
  if (searchQuery.value !== lastSearchedQuery.value) {
    refresh(true);
  }
}

const debouncedRefresh = debounce(() => refresh(true), 1000);

// Sync filters to URL
function updateUrlParams() {
  const query: Record<string, string> = {};

  if (searchQuery.value) {
    query.q = searchQuery.value;
  }

  if (filteringTags.value.length > 0) {
    query.tags = filteringTags.value.join(',');
  }

  if (!healthScoreIsAtDefault.value) {
    query.health = `${healthScoreRange.value[0]}-${healthScoreRange.value[1]}`;
  }

  if (!kcalIsAtDefault.value) {
    query.kcal = `${kcalRange.value[0]}-${kcalRange.value[1]}`;
  }

  if (!costIsAtDefault.value) {
    query.cost = `${costRange.value[0]}-${costRange.value[1]}`;
  }

  if (selectedSorting.value !== 'Popularity') {
    query.sort = selectedSorting.value;
  }

  router.replace({ query });
}

// Load filters from URL
function loadFromUrlParams() {
  const query = route.query;

  if (query.q && typeof query.q === 'string') {
    searchQuery.value = query.q;
    lastSearchedQuery.value = query.q;
  }

  if (query.tags && typeof query.tags === 'string') {
    const tagIds = query.tags.split(',').map(Number).filter(Boolean);
    filteringTags.value = tagIds;

    // Update visible tags
    tagIds.forEach((tagId) => {
      const category = categories.value.find((c) => c.tag === tagId);
      const cuisine = cuisines.value.find((c) => c.tag === tagId);
      const tagName = category?.name || cuisine?.name;
      if (tagName && !visibleTags.value.includes(tagName)) {
        visibleTags.value.push(tagName);
      }
    });
  }

  if (query.health && typeof query.health === 'string') {
    const [min, max] = query.health.split('-').map(Number);
    if (!isNaN(min) && !isNaN(max)) {
      healthScoreRange.value = [min, max];
      updateGradeTag(min, max);
    }
  }

  if (query.kcal && typeof query.kcal === 'string') {
    const [min, max] = query.kcal.split('-').map(Number);
    if (!isNaN(min) && !isNaN(max)) {
      kcalRange.value = [min, max];
      updateKcalTag(min, max);
    }
  }

  if (query.cost && typeof query.cost === 'string') {
    const [min, max] = query.cost.split('-').map(Number);
    if (!isNaN(min) && !isNaN(max)) {
      costRange.value = [min, max];
      updateCostTag(min, max);
    }
  }

  if (query.sort && typeof query.sort === 'string') {
    const sortOption = sorts.value.find((s) => s.displayName === query.sort);
    if (sortOption) {
      selectedSorting.value = query.sort;
    }
  }
}

watch(
  filtering,
  () => {
    if (!isInitialLoad.value) {
      debouncedRefresh();
      updateUrlParams();
    }
  },
  { deep: true }
);

watch(selectedSorting, () => {
  if (!isInitialLoad.value) {
    refresh(false);
    updateUrlParams();
  }
});

watch(searchQuery, () => {
  if (!isInitialLoad.value) {
    updateUrlParams();
  }
});

let observer: IntersectionObserver | null = null;

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect();
  }
});

onMounted(async () => {
  // Load filters from URL before refreshing
  loadFromUrlParams();

  await refresh(true);
  isInitialLoad.value = false;
  await nextTick();

  observer = new IntersectionObserver(
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
  } else {
    // Find the tag ID from categories or cuisines
    const category = categories.value.find((c) => c.name === tagName);
    const cuisine = cuisines.value.find((c) => c.name === tagName);
    const tagId = category?.tag || cuisine?.tag;

    if (tagId) {
      const tagIndex = filteringTags.value.indexOf(tagId);
      if (tagIndex > -1) {
        filteringTags.value.splice(tagIndex, 1);
      }
    }
  }
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

function toggleTag(item: { name: string; icon: string; tag: number }) {
  const index = filteringTags.value.indexOf(item.tag);
  if (index > -1) {
    // Remove tag
    filteringTags.value.splice(index, 1);
    const visibleIndex = visibleTags.value.indexOf(item.name);
    if (visibleIndex > -1) {
      visibleTags.value.splice(visibleIndex, 1);
    }
  } else {
    // Add tag
    filteringTags.value.push(item.tag);
    if (!visibleTags.value.includes(item.name)) {
      visibleTags.value.push(item.name);
    }
  }
}
</script>

<style scoped></style>
