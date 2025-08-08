<template>
  <div
    class="w-[clamp(70vw,1550px,100%)] mx-auto mt-6 space-y-8 sm:space-y-10 px-4"
  >
    <div class="flex flex-col items-start">
      <Logo class="xm:hidden" />
      <div class="flex items-center gap-2 mt-10">
        <span class="material-symbols-outlined !text-2xl">{{
          greeting.icon
        }}</span>
        <span class="text-base sm:text-lg font-light">{{ greeting.base }}</span>
      </div>
      <h1 class="text-2xl sm:text-4xl font-bold">
        What would you like to cook today?
      </h1>
    </div>

    <div
      class="flex items-center gap-2 rounded-md p-2 shadow-sm max-w-lg focus-within:shadow-md transition-all duration-100"
    >
      <span class="material-symbols-outlined text-gray-400 !text-lg"
        >search</span
      >
      <input
        type="text"
        placeholder="Search for a recipe"
        class="flex-1 focus:outline-none"
      />
    </div>

    <!-- Categories -->
    <div>
      <div class="py-1">
        <Carousel>
          <div
            v-for="category in categories"
            :key="category.tag"
            class="flex flex-col sm:flex-row items-center gap-2 sm:shadow-sm rounded-lg p-2 hover:shadow-md transition-all duration-300 flex-shrink-0"
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

    <!-- Recommendations -->
    <div>
      <div class="mt-4 flex justify-between items-center">
        <h2 class="text-xl sm:text-2xl font-bold">Recommendations</h2>
        <NuxtLink to="/recipes" class="text-sm text-gray-500">See all</NuxtLink>
      </div>
      <div class="mt-4">
        <Carousel class="">
          <RecipeCard
            v-for="recipe in recipeStore.indexRecipes"
            :key="recipe.id"
            :recipe="recipe"
            class="w-50 h-80 text-[20px] sm:w-70 sm:h-100 sm:text-[28px] flex-shrink-0 hover:translate-y-[-2px] transition-all duration-300"
          />
        </Carousel>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const recipeStore = useRecipeStore();

if (!recipeStore.indexRecipes.length) {
  const { data, pending, error } = await useRecipesPartial(
    () => ({
      eq: { visibility: 'PUBLIC' },
      not: { picture: null },
      orderBy: { column: 'title', ascending: true },
      limit: 14,
    }),
    'index'
  );
  watchEffect(() => {
    recipeStore.setIndexRecipes(data.value ?? []);
  });
}

const auth = useAuthStore();
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
  if (auth.user) {
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
</script>

<style scoped></style>
