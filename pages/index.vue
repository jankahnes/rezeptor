<template>
  <div class="w-[clamp(70vw,1550px,100%)] mx-auto space-y-8 sm:space-y-10 p-4">
    <div>
      <div class="flex flex-col items-start gap-4">
        <Logo class="xm:hidden mt-2" />
        <div class="flex items-center gap-2 mt-10">
          <span class="text-lg sm:text-2xl font-bold"
            >{{ greeting.base }}! What would you like to cook today?</span
          >
        </div>
      </div>
      <div class="py-1 mt-4 space-y-4">
        <Carousel>
          <div
            v-for="category in categories"
            :key="category.tag"
            class="flex flex-col sm:flex-row items-center gap-x-1 px-3 py-1 transition-all duration-300 flex-shrink-0 button m-1"
            @click="onClickCategory(category.tag)"
          >
            <span class="text-2xl">{{ category.icon }}</span>
            <span class="text-sm sm:text-base sm:tracking-wider text-nowrap">{{
              category.name
            }}</span>
          </div>
        </Carousel>
        <div class="flex gap-4">
          <button
            class="button flex justify-center items-center gap-2 px-2 py-1"
            @click="handleQuickImport"
          >
            <span class="material-symbols-outlined">content_copy</span>
            <span>Quick Import</span>
          </button>
          <NuxtLink
            to="/foods/scan"
            class="button flex justify-center items-center gap-2 px-2 py-1"
          >
            <span class="material-symbols-outlined">barcode</span>
            <span>Quick Scan</span>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Your Recipes -->
    <div v-if="userRecipes && userRecipes.length > 0" class="pt-4">
      <h2
        class="inline-block px-4 py-1 bg-primary text-white rounded-lg text-lg font-bold"
      >
        FROM YOUR COOKBOOK
      </h2>
      <Carousel :flex-class="'items-center'">
        <RecipeCardHorizontal
          v-for="(recipe, index) in userRecipes"
          :key="recipe.id"
          :recipe="recipe"
          class="text-[28px] my-4 pr-6"
        />
      </Carousel>
    </div>

    <!-- Recommendations -->
    <div class="2lg:hidden">
      <div class="flex gap-4 justify-between items-center">
        <NuxtLink to="/recipes/" class="inline-block px-4 py-1 bg-primary text-white rounded-lg text-lg font-bold">
          RECOMMENDATIONS
        </NuxtLink>
        <NuxtLink to="/recipes/" class="flex text-gray-500 items-center gap-2">
          <span class="material-symbols-outlined !text-sm">
            arrow_forward
          </span>
          <span>See all</span>
        </NuxtLink>
      </div>
      <div class="mt-2">
        <Carousel class="" :flexClass="'!items-stretch'">
          <RecipeCard
            v-for="(recipe, index) in recipeStore.indexRecipes"
            :key="recipe.id + 'mobile'"
            :id="'mobile'"
            :recipe="recipe"
            class="w-50 min-h-60 text-[20px] sm:w-70 sm:min-h-95 sm:text-[30px] flex-shrink-0 hover:translate-y-[-2px] transition-all duration-300 mt-6 mb-2 mr-4"
          />
        </Carousel>
      </div>
    </div>

    <div class="hidden 2lg:block">
      <div class="flex gap-4 justify-between items-center">
        <NuxtLink to="/recipes/" class="inline-block px-4 py-1 bg-primary text-white rounded-lg text-lg font-bold"> 
          RECOMMENDATIONS
        </NuxtLink>
        <NuxtLink to="/recipes/" class="hidden sm:flex text-gray-500 items-center gap-2">
          <span class="material-symbols-outlined !text-sm">
            arrow_forward
          </span>
          <span>See all</span>
        </NuxtLink>
      </div>
      <div class="mt-10 flex gap-10">
        <div class="flex gap-10 flex-col justify-between">
          <RecipeCard
            :key="recipeStore.indexRecipes[0]?.id + 'desktop'"
            :recipe="recipeStore.indexRecipes[0]"
            :id="'desktop'"
            class="w-110 text-[32px] flex-shrink-0 hover:translate-y-[-2px] transition-all duration-300"
          />
          <RecipeCard
            :key="recipeStore.indexRecipes[1]?.id + 'desktop'"
            :recipe="recipeStore.indexRecipes[1]"
            :id="'desktop'"
            class="w-110 text-[32px] flex-shrink-0 hover:translate-y-[-2px] transition-all duration-300"
          />
          <div class="p-4 flex flex-col items-start gap-4">
            <h2
              class="px-4 py-0.5 text-primary outline-2 outline-primary rounded-lg text-lg font-bold"
            >
              TIRED OF SCATTERED RECIPES?
            </h2>
            <NuxtLink
              to="/recipe/new/?view=import"
              class="text-primary flex items-center gap-2 button px-2 py-1"
            >
              <span class="material-symbols-outlined"> more_up </span>
              <span>Import your recipes from any source</span>
            </NuxtLink>
            <NuxtLink
              to="/recipe/new/?view=picture"
              class="text-primary flex items-center gap-2 button px-2 py-1"
            >
              <span class="material-symbols-outlined"> visibility </span>
              <span>Scan your cookbooks</span>
            </NuxtLink>
            <span class="text-sm text-gray-500"
              >...and get science-based nutrition and health insights!</span
            >
          </div>
        </div>
        <div class="flex gap-10 flex-wrap py-1 recipe-container">
          <RecipeCard
            v-for="(recipe, index) in recipeStore.indexRecipes.slice(2)"
            :key="recipe.id + 'desktop'"
            :recipe="recipe"
            :id="'desktop-' + index + '-' + recipe.id"
            class="min-w-60 basis-70 max-w-90 flex-1 min-h-50 text-[30px] hover:translate-y-[-2px] transition-all duration-300"
          />
        </div>
      </div>
    </div>

    <div class="flex flex-wrap">
      <div class="flex flex-col gap-4">
        <div class="flex gap-4 justify-between items-center">
          <NuxtLink to="/recipes/social/" class="inline-block px-4 py-1 bg-primary text-white rounded-lg text-lg font-bold">
            TRENDING ON SOCIAL MEDIA
          </NuxtLink>
          <NuxtLink
            to="/recipes/social/"
            class="hidden sm:flex text-gray-500 items-center gap-2 flex-shrink-0"
          >
            <span class="material-symbols-outlined !text-sm">
              arrow_forward
            </span>
            <span>See all</span>
          </NuxtLink>
        </div>
        <div class="flex flex-wrap gap-4 mt-6">
          <RecipeCardSocialMedia
            v-for="recipe in socialRecipes"
            :key="recipe.id"
            :recipe="recipe"
            class="max-h-60 max-w-240 basis-150"
          />
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div v-if="recentActivity && recentActivity.length > 0">
      <h2
        class="inline-block px-4 py-1 bg-primary text-white rounded-lg text-lg font-bold"
      >
        RECENT ACTIVITY
      </h2>
      <Carousel class="mt-4" :flexClass="'!items-stretch'">
        <FeedItem
          v-for="item in recentActivity.slice(0, 8)"
          :key="item.id"
          :feed-item="item"
          class="min-w-90 ml-2 mb-4"
        />
      </Carousel>
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
  const { data } = await useAsyncData('index', () =>
    getRecipeOverviews(supabase, {
      //eq: { visibility: 'PUBLIC' },
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

<style scoped>
@media (max-width: 1446px) {
  .recipe-container :nth-child(n + 7) {
    display: none;
  }
}
</style>
