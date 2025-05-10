<template>
  <!-- Hero Section -->
  <div class="px-60 bg-[#91e9956b] flex">
    <div
      class="mx-auto px-4 w-full sm:px-6 lg:px-1 pt-18 flex flex-shrink justify-between"
    >
      <div class="max-w-lg">
        <h1
          class="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl"
        >
          Your Personal Recipe Collection
        </h1>
        <p class="mt-6 text-xl text-gray-500">
          Save, organize, and discover recipes. Build your digital cookbook and
          connect with food lovers around the world.
        </p>
        <div class="mt-13">
          <NuxtLink
            to="/register"
            class="px-8 py-3 text-xl bg-white cursor-pointer whitespace-nowrap border-[2px] border-black font-bold shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
          >
            Start Your Cookbook
          </NuxtLink>
        </div>
      </div>
      <div class="mr-30">
        <img
          src="@/public/chef.png"
          alt="Jolly chef with recipe book"
          class="h-90"
        />
      </div>
    </div>
  </div>
  <!-- How It Works Section -->
  <div class="py-20 text-center">
    <h2 class="text-3xl font-extrabold">
      <NuxtLink to="overview">How It Works</NuxtLink>
    </h2>
    <p class="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
      Build your digital cookbook in three simple steps
    </p>
  </div>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
      <div class="flex flex-col items-center">
        <div
          class="flex items-center justify-center h-16 w-16 rounded-full border-2 mb-4 text-[40px]"
        >
          <span class="material-icons text-[#91e996]">add</span>
        </div>
        <h3 class="text-xl font-medium text-gray-900">Save Recipes</h3>
        <p class="mt-2 text-gray-500 text-center">
          Add your own recipes or save ones you discover from the community
        </p>
      </div>
      <div class="flex flex-col items-center">
        <div
          class="flex items-center justify-center h-16 w-16 rounded-full border-2 mb-4 text-[30px]"
        >
          <span class="text-4xl material-icons text-[#91e996]">sell</span>
        </div>
        <h3 class="text-xl font-medium">Organize & Tag</h3>
        <p class="mt-2 text-base text-gray-500 text-center">
          Categorize recipes with tags for easy filtering and searching
        </p>
      </div>
      <div class="flex flex-col items-center">
        <div
          class="flex items-center justify-center h-16 w-16 rounded-full border-2 mb-4 text-[30px]"
        >
          <span class="text-2xl material-icons text-[#91e996]">analytics</span>
        </div>
        <h3 class="text-xl font-medium">Track Ingredients</h3>
        <p class="mt-2 text-base text-gray-500 text-center">
          Manage ingredients with nutritional information and scan labels
        </p>
      </div>
    </div>
  </div>
  <!-- Discover Recipes Section -->
  <div class="py-20 text-center">
    <h2 class="text-3xl font-extrabold">
      <NuxtLink to="recipes">Discover</NuxtLink>
    </h2>
  </div>
  <div class="px-20 mb-10">
    <div
      class="grid gap-8 grid-cols-[repeat(auto-fit,80vw)] sm:grid-cols-[repeat(auto-fit,460px)] 3xl:!grid-cols-[repeat(auto-fit,560px))] justify-center max-w-[2000px] mx-auto"
    >
      <div class="flex justify-center"><RecipeCard /></div>
      <div class="flex justify-center"><RecipeCard /></div>
      <div class="flex justify-center"><RecipeCard /></div>
      <div class="flex justify-center"><RecipeCard /></div>
      <div class="flex justify-center"><RecipeCard /></div>
      <div class="flex justify-center"><RecipeCard /></div>
    </div>
  </div>
  <div class="w-full flex justify-center mb-10">
    <NuxtLink
      to="/recipes"
      class="px-5 py-2 text-xl bg-white cursor-pointer whitespace-nowrap border-2 font-bold shadow-[3px_3px_0_0_rgba(0,0,0,1)]"
    >
      Explore more Recipes
    </NuxtLink>
  </div>
  <div class="w-[90%] h-[2px] mx-auto px-3 bg-black mb-10"></div>
</template>

<script lang="ts" setup></script>

<style scoped></style>
