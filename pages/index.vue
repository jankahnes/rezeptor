<template>
  <div
    class="w-[clamp(70vw,1550px,100%)] mx-auto mt-2 space-y-8 sm:space-y-10 px-4"
  >
    <div class="flex flex-col items-start">
      <Logo class="xm:hidden mt-2" />
      <div class="flex items-center gap-2 mt-10">
        <span class="material-symbols-outlined !text-2xl">{{
          greeting.icon
        }}</span>
        <span class="text-base sm:text-lg font-light">{{ greeting.base }}</span>
      </div>
      <h1 class="text-2xl sm:text-4xl font-bold tracking-tight">
        What would you like to cook today?
      </h1>
    </div>


    <!-- Categories -->
    <div>
      <div class="py-1">
        <Carousel>
          <div
            v-for="category in categories"
            :key="category.tag"
            class="flex flex-col sm:flex-row items-center gap-x-1 px-2 py-1 transition-all duration-300 flex-shrink-0 button category-button m-1"
          >
            <span class="text-2xl">{{ category.icon }}</span>
            <span
              class="font-bold text-sm tracking-normal sm:text-base sm:font-normal sm:tracking-wider text-nowrap"
              >{{ category.name }}</span
            >
          </div>
        </Carousel>
      </div>
    </div>


    <!-- Your Recipes -->
    <div v-if="userRecipes && userRecipes.length > 0" class="pt-4">
      <div class="flex justify-between items-center">
        <h2 class="text-xl sm:text-2xl font-bold tracking-tight">
          Your Recipes
        </h2>
        <NuxtLink
          :to="auth.isUser() ? `/profile/${auth.user?.id}` : '/onboarding'"
          class="text-sm text-gray-500"
        >
          See all
        </NuxtLink>
      </div>
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
    <div>
      <div class="mt-2 flex justify-between items-center">
        <h2 class="text-xl sm:text-2xl font-bold">Recommendations</h2>
        <NuxtLink to="/recipes" class="text-sm text-gray-500">See all</NuxtLink>
      </div>
      <div class="mt-2">
        <Carousel class="" :flexClass="'!items-stretch'">
          <RecipeCard
            v-for="(recipe, index) in recipeStore.indexRecipes"
            :key="recipe.id"
            :recipe="recipe"
            class="w-50 min-h-70 text-[20px] sm:w-70 sm:min-h-95 sm:text-[28px] flex-shrink-0 hover:translate-y-[-2px] transition-all duration-300 mt-6 mb-2 mr-4"
          />
        </Carousel>
      </div>
    </div>

    <!-- Recent Activity -->
    <div v-if="recentActivity && recentActivity.length > 0">
      <div class="flex justify-between items-center">
        <h2 class="text-xl sm:text-2xl font-bold">Recent Activity</h2>
      </div>
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

const userRecipes = ref<RecipeOverview[] | null>(null);
const recentActivity = ref<Activity[] | null>(null);

if (!recipeStore.indexRecipes.length) {
  const { data } = await useAsyncData('index', () =>
    getRecipeOverviews(supabase, {
      eq: { visibility: 'PUBLIC' },
      not: { picture: null },
      orderBy: { column: 'created_at', ascending: false },
      limit: 14,
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
</script>

<style scoped>
.category-button {
  @media (max-width: 768px) {
    box-shadow: none !important;
  }
}
</style>
