<template>
  <div class="mx-4 sm:mx-10 sm:mr-16 space-y-8 sm:space-y-10 py-6">
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
            >discover_tune</span
          >
        </NuxtLink>
      </div>
    </div>
    <div class="flex items-center gap-2 justify-between">
      <h1 class="text-5xl font-bold pt-4">Discover</h1>
      <div class="items-center gap-4 hidden sm:flex">
        <div class="flex flex-col items-center">
          <p class="text-3xl font-bold text-primary leading-none">1194</p>
          <p class="text-xs text-gray-500 leading-none">Recipes</p>
        </div>
        <div class="flex flex-col items-center">
          <p class="text-3xl font-bold text-primary leading-none">8890</p>
          <p class="text-xs text-gray-500 leading-none">Foods</p>
        </div>
      </div>
    </div>
    <BlocksCarousel>
      <div
        v-for="category in categories"
        :key="category.tag"
        class="flex flex-col sm:flex-row items-center gap-x-1 px-3 py-1 transition-all duration-300 flex-shrink-0 animated-button rounded-2xl! sm:rounded-2xl! my-2 mr-4 text-gray-600 bg-primary-10 sm:bg-none"
        @click="onClickCategory(category.tag)"
      >
        <span class="text-2xl">{{ category.icon }}</span>
        <span class="text-sm sm:text-base sm:tracking-wider text-nowrap">{{
          category.name
        }}</span>
      </div>
    </BlocksCarousel>

    <!-- Recommendations -->
    <div class="2lg:hidden">
      <BlocksCarousel class="" :flexClass="'!items-stretch'">
        <RecipeCard
          v-for="(recipe, index) in recipeStore.indexRecipes"
          :key="recipe.id + 'mobile'"
          :id="'mobile'"
          :recipe="recipe"
          class="w-50 min-h-60 text-[20px] sm:w-70 sm:min-h-95 sm:text-[30px] flex-shrink-0 mt-6 mb-2 mr-4"
        />
      </BlocksCarousel>
    </div>

    <div class="hidden 2lg:block">
      <div class="flex gap-10 flex-wrap py-1">
        <RecipeCard
          v-for="(recipe, index) in recipeStore.indexRecipes.slice(0, 5)"
          :key="recipe.id + 'desktop'"
          :recipe="recipe"
          :id="'desktop-' + index + '-' + recipe.id"
          :uniqueId="'desktop-' + index + '-' + recipe.id"
          class="min-w-50 basis-50 max-w-100 flex-1 min-h-50 text-[30px]"
        />
      </div>
    </div>

    <div class="flex flex-wrap">
      <div class="flex flex-col gap-4 items-start">
        <NuxtLink
          to="/recipes/social/"
          class="inline-block px-4 py-1 bg-primary-10 rounded-lg text-lg font-bold"
        >
          TRENDING ON SOCIAL MEDIA
        </NuxtLink>
        <div class="flex flex-wrap gap-4 mt-6">
          <RecipeCardSocialMedia
            v-for="recipe in socialRecipes"
            :key="recipe.id"
            :recipe="recipe"
            :uniqueId="'social-' + recipe.id"
            class="max-h-60 max-w-240 basis-150"
          />
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div v-if="recentActivity && recentActivity.length > 0">
      <h2
        class="inline-block px-4 py-1 bg-primary-10 rounded-lg text-lg font-bold"
      >
        RECENT ACTIVITY
      </h2>
      <BlocksCarousel class="mt-4" :flexClass="'!items-stretch'">
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
const socialRecipes = ref<RecipeOverview[] | null>(null);

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

const loadUserData = async () => {
  if (!auth.user?.id) {
    userRecipes.value = [];
    return;
  }
  if (auth.user?.id && !userRecipes.value?.length) {
    // Fetch user's recipes
    userRecipes.value = await getRecipeOverviews(supabase, {
      eq: { user_id: auth.user?.id },
      orderBy: { column: 'created_at', ascending: false },
      limit: 10,
    });
  }
};

// Load data when auth is ready
watch(() => auth.user?.id, loadUserData);

async function loadRecentActivity() {
  recentActivity.value = await getActivity(supabase, {
    orderBy: { column: 'created_at', ascending: false },
    limit: 10,
  });
}

async function loadSocialRecipes() {
  socialRecipes.value = await getRecipeOverviews(supabase, {
    orderBy: { column: 'created_at', ascending: false },
    limit: 10,
    eq: { source_type: 'MEDIA' },
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

onMounted(async () => {
  await loadUserData();
  loadSocialRecipes();
  loadRecentActivity();
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
