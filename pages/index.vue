<template>
  <!-- Hero Section -->
  <div class="">
    <div
      class="flex justify-between metallic-gradient hover-shine p-8 lg:py-10 lg:px-20 mx-2 sm:mx-10 mt-8 rounded-lg shadow-[0_0_7px_0_rgba(0,0,0,0.12)] min-h-70 md:min-h-100 overflow-hidden"
    >
      <div class="flex-col flex w-[60%] justify-between gap-10">
        <div class="space-y-2">
          <h1
            class="text-3xl xs:text-4xl font-extrabold md:text-5xl lg:text-6xl tracking-tight md:tracking-wide"
          >
            Your Personal Recipe Collection
          </h1>
          <p class="sm:block hidden mt-1 text-base md:text-xl text-gray-500">
            Save, organize, and discover recipes. Build your digital cookbook
            and connect with food lovers around the world.
          </p>
        </div>
        <NuxtLink
          to="/register"
          class="button !bg-primary text-white font-bold px-3 sm:px-8 py-3 sm:text-xl whitespace-nowrap self-start"
        >
          Start Your Cookbook
        </NuxtLink>
      </div>
      <div class="absolute -top-[10%] right-0 h-full">
        <img
          src="/feast.png"
          alt="Delicious feast plate"
          class="mask-fade-bottom h-[120%] object-cover"
        />
      </div>
    </div>
    <!-- How It Works Section -->
    <div class="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
      <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div class="flex flex-col items-center">
          <div
            class="flex items-center justify-center h-16 w-16 rounded-full border-2 mb-2 select-none"
          >
            <span class="text-4xl material-icons-outlined text-black">add</span>
          </div>
          <h3 class="text-xl font-medium text-gray-900">Save Recipes</h3>
          <p class="mt-1 text-gray-500 text-center">
            Add your own recipes or save ones you discover from the community
          </p>
        </div>
        <div class="flex flex-col items-center">
          <div
            class="flex items-center justify-center h-16 w-16 rounded-full border-2 mb-2 select-none"
          >
            <span class="text-3xl material-icons-outlined text-black"
              >sell</span
            >
          </div>
          <h3 class="text-xl font-medium">Organize & Tag</h3>
          <p class="mt-1 text-base text-gray-500 text-center">
            Categorize recipes with tags for easy filtering and searching
          </p>
        </div>
        <div class="flex flex-col items-center">
          <div
            class="flex items-center justify-center h-16 w-16 rounded-full border-2 mb-2 select-none"
          >
            <span class="text-3xl material-icons-outlined text-black"
              >analytics</span
            >
          </div>
          <h3 class="text-xl font-medium">Track Ingredients</h3>
          <p class="mt-1 text-base text-gray-500 text-center">
            Manage ingredients with nutritional information and scan labels
          </p>
        </div>
      </div>
    </div>
    <!-- Discover Recipes Section -->
    <div class="px-20 mt-20">
      <div
        class="grid gap-8 grid-cols-[repeat(auto-fit,80vw)] sm:grid-cols-[repeat(auto-fit,400px)] justify-center max-w-[2000px] mx-auto"
      >
        <div
          class="flex justify-center"
          v-for="recipe in recipeStore.indexRecipes"
          v-if="recipeStore.indexRecipes.length"
        >
          <RecipeCard :recipe="recipe" class="max-w-100 h-140 text-[34px]" />
        </div>
        <div v-else class="flex justify-center" v-for="i in 6">
          <Skeleton class="max-w-100 h-140 text-[34px] rounded-xl" />
        </div>
      </div>
    </div>
    <div class="w-full flex justify-center my-10">
      <NuxtLink
        to="/recipes"
        class="button !bg-primary text-white px-3 sm:px-8 py-3 sm:text-xl whitespace-nowrap shadow-lg font-bold"
      >
        Explore more Recipes
      </NuxtLink>
    </div>
  </div>
</template>

<script lang="ts" setup>
const recipeStore = useRecipeStore();

if (!recipeStore.indexRecipes.length) {
  const { data, pending, error } = await useRecipesPartial(
    () => ({
      eq: { visibility: 'PUBLIC' },
      not: { picture_ext: null },
      limit: 6,
    }),
    'index'
  );
  watchEffect(() => {
    recipeStore.setIndexRecipes(data.value ?? []);
  });
}

//onMounted(async () => {
//  const sample = await useSupabaseClient()
//    .from('foods')
//    .select('name,id,hidx,kcal')
//    .order('name', { ascending: true })
//    .limit(20);
//  console.log(sample);
//});
</script>

<style></style>
