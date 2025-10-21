<template>
  <div
    class="w-[clamp(70vw,1550px,100%)] mx-auto mt-2 space-y-8 sm:space-y-10 px-4"
  >
    <div>
      <div class="flex flex-col items-start gap-4">
        <Logo class="xm:hidden mt-2" />
        <div class="flex items-center gap-2 mt-10">
          <span class="text-base sm:text-2xl font-bold"
            >{{ greeting.base }} What would you like to cook today?</span
          >
        </div>
      </div>
      <div class="py-1 mt-4">
        <Carousel>
          <div
            v-for="category in categories"
            :key="category.tag"
            class="flex flex-col sm:flex-row items-center gap-x-1 px-2 py-1 transition-all duration-300 flex-shrink-0 button m-1"
            @click="onClickCategory(category.tag)"
          >
            <span class="text-2xl">{{ category.icon }}</span>
            <span class="text-sm sm:text-base sm:tracking-wider text-nowrap">{{
              category.name
            }}</span>
          </div>
        </Carousel>
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
          class="text-xl my-4 pr-6"
        />
      </Carousel>
    </div>

    <!-- Recommendations -->
    <div class="sm:hidden">
      <h2
        class="inline-block px-4 py-1 bg-primary text-white rounded-lg text-lg font-bold"
      >
        RECOMMENDATIONS
      </h2>
      <div class="mt-2">
        <Carousel class="" :flexClass="'!items-stretch'">
          <RecipeCard
            v-for="(recipe, index) in recipeStore.indexRecipes"
            :key="recipe.id + 'mobile'"
            :id="'mobile'"
            :recipe="recipe"
            class="w-50 min-h-70 text-[20px] sm:w-70 sm:min-h-95 sm:text-[30px] flex-shrink-0 hover:translate-y-[-2px] transition-all duration-300 mt-6 mb-2 mr-4"
          />
        </Carousel>
      </div>
    </div>

    <div class="hidden sm:block">
      <h2
        class="inline-block px-4 py-1 bg-primary text-white rounded-lg text-lg font-bold"
      >
        RECOMMENDATIONS
      </h2>
      <div class="mt-10 flex gap-10">
        <div class="flex gap-10 flex-col justify-between">
          <RecipeCard
            :key="recipeStore.indexRecipes[0]?.id + 'desktop'"
            :recipe="recipeStore.indexRecipes[0]"
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
          <RecipeCard
            :key="recipeStore.indexRecipes[1]?.id + 'desktop'"
            :recipe="recipeStore.indexRecipes[1]"
            :id="'desktop'"
            class="w-110 text-[32px] flex-shrink-0 hover:translate-y-[-2px] transition-all duration-300"
          />
        </div>
        <div class="flex gap-10 flex-wrap">
          <RecipeCard
            v-for="(recipe, index) in recipeStore.indexRecipes.slice(2)"
            :key="recipe.id + 'desktop'"
            :recipe="recipe"
            :id="'desktop'"
            class="min-w-70 basis-70 max-w-90 flex-1 min-h-50 text-[28px] hover:translate-y-[-2px] transition-all duration-300"
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
    <div v-if="recentActivity && recentActivity.length > 0">
      <h2
        class="inline-block px-4 py-1 bg-primary text-white rounded-lg text-lg font-bold"
      >
        NUTRITION ANALYSIS ENGINE
      </h2>
      <InstantNutritionDemo class="mt-4" />
    </div>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient<Database>();
const recipeStore = useRecipeStore();
const auth = useAuthStore();

const userRecipes = ref<RecipeOverview[] | null>(null);
const recentActivity = ref<Activity[] | null>(null);

if (!recipeStore.indexRecipes.length) {
  const { data } = await useAsyncData('index', () =>
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
  if (auth.user?.id) {
    // Fetch user's recipes
    userRecipes.value = await getRecipeOverviews(supabase, {
      eq: { user_id: auth.user?.id },
      orderBy: { column: 'created_at', ascending: false },
      limit: 10,
    });
  }
};

// Load data when auth is ready
watch(() => auth.user?.id, loadUserData, { immediate: true });

const { data: activity } = await useLazyAsyncData('recent-activity', () =>
  getActivity(supabase, {
    orderBy: { column: 'created_at', ascending: false },
    limit: 10,
  })
);

watchEffect(() => {
  if (activity.value) {
    recentActivity.value = activity.value;
  }
});

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
  } else {
    base = base + '!';
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
  loadUserData();
});

const onClickCategory = (category: number) => {
  navigateTo(`/recipes?tags=${category}`);
};
</script>

<style scoped></style>
