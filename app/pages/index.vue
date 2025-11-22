<template>
  <div class="mx-4 sm:mx-20 space-y-4 sm:space-y-10 py-6">
    <div class="flex justify-between items-center gap-6">
      <div
        class="flex ring-1 ring-primary focus-within:ring-2 transition-all rounded-xl px-4 items-center gap-2 text-gray-600 bg-primary-10/40 shrink-1 min-w-0!"
      >
        <input
          type="text"
          placeholder="Search for a recipe"
          class="flex-grow focus:outline-none py-2 min-w-0!"
        />
        <span class="material-symbols-outlined">search</span>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <NuxtLink to="/" class="text-gray-500 items-center gap-2">
          <span class="material-symbols-outlined font-bold!"
            >tune</span
          >
        </NuxtLink>
      </div>
    </div>
    <div class="flex items-center gap-2 justify-between">
      <h1 class="text-5xl font-bold pt-4">🌟 Discover</h1>
      <div class="items-center gap-4 hidden sm:flex">
        <div class="flex flex-col items-center">
          <p class="text-3xl font-bold text-primary leading-none">1194</p>
          <p class="text-xs text-gray-600 leading-none">Recipes</p>
        </div>
        <div class="flex flex-col items-center">
          <p class="text-3xl font-bold text-primary leading-none">8890</p>
          <p class="text-xs text-gray-600 leading-none">Foods</p>
        </div>
      </div>
    </div>

    <!-- Categories -->
    <BlocksCarousel>
      <div
        class="flex items-center gap-x-1 px-3 py-1 transition-all duration-300 flex-shrink-0 animated-button rounded-2xl! my-2 mr-2 sm:mr-4 text-gray-600 bg-primary-10"
        @click="navigateTo('/recipes/social')"
      >
        <span class="text-2xl">🔥</span>
        <span class="text-sm sm:text-base sm:tracking-wider text-nowrap"
          >Trending</span
        >
      </div>
      <div
        v-for="category in categories"
        :key="category.tag"
        class="flex items-center gap-x-1 px-3 py-1 transition-all duration-300 flex-shrink-0 animated-button rounded-2xl! my-2 mr-2 sm:mr-4 text-gray-600 bg-primary-10"
        @click="onClickCategory(category.tag)"
      >
        <span class="text-2xl">{{ category.icon }}</span>
        <span class="text-sm sm:text-base sm:tracking-wider text-nowrap">{{
          category.name
        }}</span>
      </div>
    </BlocksCarousel>

    <!-- Recommendations: Mobile -->
    <div class="2lg:hidden space-y-2" v-if="recipeStore.indexRecipes.length > 0">
      <BlocksCarousel class="" :flexClass="'!items-stretch'">
        <RecipeCard
          v-for="(recipe, index) in recipeStore.indexRecipes.slice(1)"
          :key="recipe.id + 'mobile'"
          :id="'mobile'"
          :recipe="recipe"
          class="w-50 min-h-60 text-[20px] sm:w-70 sm:min-h-95 sm:text-[30px] flex-shrink-0 mb-2 mr-4"
        />
      </BlocksCarousel>
      <RecipeCardHighlight
        v-if="recipeStore.indexRecipes[0]"
        :recipe="recipeStore.indexRecipes[0]"
        :uniqueId="'mobile-0-0'"
        class="md:-ml-10! text-[20px] md:text-[30px]"
      />
    </div>

    <!-- Recommendations: Desktop -->
    <div
      class="hidden 2lg:block transition-all duration-150"
      :class="
        rowMaxHeight ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-x-2'
      "
    >
      <div
        class="flex gap-8 py-1 overflow-hidden"
        :class="rowMaxHeight ? 'flex-wrap' : 'flex-nowrap'"
        :style="{
          maxHeight: rowMaxHeight ? rowMaxHeight + 'px' : undefined,
        }"
      >
        <RecipeCard
          :key="0"
          :recipe="recipeStore.indexRecipes[1]!"
          :id="'desktop-0-0'"
          :uniqueId="'desktop-0-0'"
          class="basis-54 max-w-92 2xl:basis-62 2xl:max-w-110 flex-1 text-[30px]"
          ref="firstCard"
        />
        <RecipeCard
          v-for="(recipe, index) in recipeStore.indexRecipes.slice(2, 7)"
          :key="recipe.id + 'desktop'"
          :recipe="recipe"
          :id="'desktop-' + index + '-' + recipe.id"
          :uniqueId="'desktop-' + index + '-' + recipe.id"
          class="basis-60 max-w-100 flex-1 text-[30px]"
        />
      </div>
      <div class="flex mt-8 flex-wrap gap-8 items-stretch">
        <RecipeCardHighlight
          v-if="recipeStore.indexRecipes[0]"
          :recipe="recipeStore.indexRecipes[0]"
          :uniqueId="'desktop-0-0'"
          class="-ml-10! flex-1 basis-220"
        />
        <div class="flex flex-wrap gap-4 shrink-0 basis-80 flex-1 items-center">
          <RecipeCardHorizontal
            v-for="(recipe, index) in recipeStore.indexRecipes.slice(7, 9)"
            :key="recipe.id + 'desktop'"
            :recipe="recipe"
            :id="'desktop-' + index + '-' + recipe.id"
            :uniqueId="'desktop-' + index + '-' + recipe.id"
            class="text-[30px] basis-95 flex-1"
          />
          <RecipeCardHorizontal
            v-for="(recipe, index) in recipeStore.indexRecipes.slice(9, 11)"
            :key="recipe.id + 'desktop'"
            :recipe="recipe"
            :id="'desktop-' + index + '-' + recipe.id"
            :uniqueId="'desktop-' + index + '-' + recipe.id"
            class="text-[30px] hidden 3xl:flex basis-95 flex-1"
          />
        </div>
      </div>
    </div>

    <!-- Social Media Cards -->
    <Transition name="loaded-content">
      <div class="flex flex-wrap pt-4">
        <div class="flex flex-col gap-4 items-start">
          <NuxtLink
            to="/recipes/social/"
            class="inline-block text-xl font-bold"
          >
            Trending on Social Media
          </NuxtLink>
          <div class="flex flex-wrap gap-4">
            <RecipeCardSocialMedia
              v-for="recipe in recipeStore.socialIndexRecipes"
              :key="recipe.id"
              :recipe="recipe"
              :uniqueId="'social-' + recipe.id"
              class="max-h-60 max-w-240 basis-150"
            />
          </div>
        </div>
      </div>
    </Transition>

    <!-- Recent Activity -->
    <div v-if="recentActivity && recentActivity.length > 0">
      <h2 class="text-xl font-bold">
        Recent Activity
      </h2>
      <BlocksCarousel class="mt-4 -ml-2" :flexClass="'!items-stretch'">
        <FeedItem
          v-for="item in recentActivity.slice(0, 8)"
          :key="item.id"
          :feed-item="item"
          class="min-w-90 ml-2 mb-4"
        />
      </BlocksCarousel>
    </div>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient<Database>();
const recipeStore = useRecipeStore();
const auth = useAuthStore();
const loadingStore = useLoadingStore();

const userRecipes = ref<RecipeOverview[] | null>(null);
const recentActivity = ref<Activity[] | null>(null);

useHead({ title: 'Rezeptor' });

const firstCard = ref<any>(null);
const rowMaxHeight = ref(0);
const ro = ref<ResizeObserver | null>(null);

if (!recipeStore.indexRecipes.length) {
  const { data } = await useLazyAsyncData('index', () =>
    getRecipeOverviews(supabase, {
      eq: { visibility: 'PUBLIC' },
      not: { picture: null },
      orderBy: { column: 'relevancy', ascending: false },
      limit: 11,
    })
  );
  watchEffect(() => {
    recipeStore.setIndexRecipes(data.value ?? []);
  });
}

if (!recipeStore.socialIndexRecipes.length) {
  useAsyncData('social', () =>
    getRecipeOverviews(supabase, {
      orderBy: { column: 'created_at', ascending: false },
      limit: 6,
      eq: { source_type: 'MEDIA' },
    })
  ).then(({ data }) => recipeStore.setSocialIndexRecipes(data.value ?? []));
}

async function loadRecentActivity() {
  recentActivity.value = await getActivity(supabase, {
    orderBy: { column: 'created_at', ascending: false },
    limit: 10,
  });
}

const greeting = computed(() => {
  let base;
  let icon;
  const hour = new Date().getHours();
  if (hour < 12 && hour > 5) {
    base = 'Good morning';
    icon = 'sunny';
  } else if (hour < 18 && hour > 12) {
    base = 'Good afternoon';
    icon = 'sunny';
  } else {
    base = 'Good evening';
    icon = 'local_bar';
  }
  if (auth.isUser()) {
    base = `${base}, ${(auth.user as any).username}`;
  }
  return { base, icon };
});

const categories = ref([
  {
    name: 'Breakfast',
    icon: '🥐',
    tag: 201,
  },
  {
    name: 'Lunch',
    icon: '🍔',
    tag: 205,
  },
  {
    name: 'Dinner',
    icon: '🍝',
    tag: 200,
  },
  {
    name: 'Snacks',
    icon: '🍟',
    tag: 203,
  },
  {
    name: 'Dessert',
    icon: '🍰',
    tag: 204,
  },
  {
    name: 'Quick and Easy',
    icon: '⚡',
    tag: 3,
  },
  {
    name: 'Healthy',
    icon: '🏵️',
    tag: 100,
  },
  {
    name: 'Budget',
    icon: '💰',
    tag: 4,
  },
  {
    name: 'Meal Prep',
    icon: '🍱',
    tag: 5,
  },
]);

function measure() {
  if (!firstCard.value) return;
  const el = firstCard.value.$el;
  if (el instanceof HTMLElement) {
    rowMaxHeight.value = el.offsetHeight;
  }
}

onMounted(async () => {
  loadRecentActivity();
  await nextTick();
  measure();
  ro.value = new ResizeObserver(measure);
});

watchEffect(() => {
  if (firstCard.value && ro.value) {
    const el = firstCard.value.$el;
    if (el instanceof Element) {
      ro.value?.observe(el);
    }
  }
});

onBeforeUnmount(() => {
  ro.value?.disconnect();
});

const onClickCategory = (category: number) => {
  navigateTo(`/recipes?tags=${category}`);
};

const handleQuickImport = async () => {
  try {
    const clipboardText = await navigator.clipboard.readText();
    const url = new URL(clipboardText);
    if (!clipboardText.trim()) {
      loadingStore.displayTransientToast('❌ Clipboard is empty');
      return;
    }
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      navigateTo(
        `/recipe/new?view=loading&link=${encodeURIComponent(clipboardText)}`
      );
    } else {
      loadingStore.displayTransientToast('❌ Clipboard is not a valid URL');
    }
  } catch (error) {
    loadingStore.displayTransientToast('❌ Clipboard is not a valid URL');
  }
};
</script>

<style scoped></style>
