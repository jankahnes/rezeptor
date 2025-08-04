<template>
  <div class="mx-auto max-w-screen-xl justify-center relative px-3">
    <NuxtImg
      :src="recipeStore.recipe?.picture"
      class="w-full md:h-100 object-cover rounded-xl"
    />
    <div
      class="max-w-screen-lg flex flex-col gap-4 bg-primary-900 p-8 rounded-xl text-white mx-auto -mt-20 relative z-10 shadow-md shadow-primary-900/70"
    >
      <div class="flex justify-between items-start gap-4">
        <h1 class="text-4xl font-bold">{{ recipeStore.recipe?.title }}</h1>
        <div class="flex gap-2 flex-wrap">
          <button
            class="button px-3 py-1 rounded-lg flex items-center !bg-transparent border-white border"
          >
            <span class="material-symbols-outlined">share</span>
          </button>
          <button
            class="button px-3 py-1 rounded-lg flex items-center !bg-transparent border-white border"
          >
            <span class="material-symbols-outlined">edit</span>
          </button>
          <button
            class="button px-3 py-1 rounded-lg flex items-center !bg-transparent border-white border"
          >
            <span class="material-symbols-outlined">delete</span>
          </button>
          <button
            class="button px-3 py-1 rounded-lg flex items-center !bg-transparent border-white border"
          >
            <span class="material-symbols-outlined">print</span>
          </button>
        </div>
      </div>
      <div class="flex items-center gap-2" v-if="recipeStore.recipe?.user">
        <Avatar :user="recipeStore.recipe?.user as any" class="w-8 h-8" />
        <span class="text-sm"
          >{{ recipeStore.recipe?.user?.username }} ·
          {{ timeAgo(recipeStore.recipe?.created_at) }}</span
        >
      </div>
      <div class="flex items-center gap-1 flex-wrap">
        <FormsRatingField
          v-if="recipeStore.recipe?.rating"
          v-model="recipeStore.recipe.rating"
          :select="false"
          :star-width="20"
          :star-height="20"
          :spacing="-2"
          :id="250"
        ></FormsRatingField>
        <span class="text-sm font-semibold"
          >{{ recipeStore.recipe?.rating?.toFixed(1) }}
        </span>
        <span class="material-symbols-outlined ml-3 !text-2xl">timer</span>
        <span class="text-sm"
          >{{ capitalize(recipeStore.recipe?.effort) }} Effort</span
        >
        <span class="material-symbols-outlined ml-3 !text-2xl">bolt</span>
        <span class="text-sm">{{
          capitalize(recipeStore.recipe?.difficulty)
        }} Difficulty</span
        >
        <span class="material-symbols-outlined ml-3 !text-2xl"
          >attach_money</span
        >
        <span class="text-sm"
          >{{ formatMoney(recipeStore.recipe?.price) }} per serving</span
        >
      </div>
      <div class="">
        {{ recipeStore.recipe?.description }}
      </div>
      <div class="flex flex-wrap gap-2">
        <div
          class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border-white border"
          v-if="recipeStore.recipe?.tags"
          v-for="tag in recipeStore.recipe?.tags"
          :key="tag"
        >
          {{ getTagByID(tag)?.name }}
        </div>
      </div>
      <div class="flex flex-wrap gap-6 mt-4">
        <NuxtLink to="#comments" class="text-sm">Reviews ⌵</NuxtLink>
        <NuxtLink to="#nutrition" class="text-sm">Nutrition ⌵</NuxtLink>
        <NuxtLink :to="`/recipe/${id}/report`" class="text-sm"
          >Full Health Report →</NuxtLink
        >
      </div>
    </div>
    <div class="flex gap-10 mt-10 max-w-screen-lg mx-auto flex-wrap">
      <PagesRecipeIngredientList
        :ingredients="recipeStore.recipe?.ingredients"
        class="flex-1 "
      ></PagesRecipeIngredientList>
      <PagesRecipeInstructionContainer
        v-if="recipeStore.recipe?.instructions"
        :instructions="recipeStore.recipe.instructions"
        class="flex-1 "
      ></PagesRecipeInstructionContainer>
      <NutritionLabel
        id="nutrition"
        :recipe="recipeStore.recipe"
        class="flex-1 "
      ></NutritionLabel>
      <HealthFacts :recipe="recipeStore.recipe" class="flex-1 "></HealthFacts>
    </div>
    <div class="flex flex-col items-center w-full gap-6 mt-20" id="comments">
      <div class="text-center">
        <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
          What others say
        </h2>
        <p class="text-gray-600">
          {{ recipeStore.recipe?.comments?.length }}
          {{
            recipeStore.recipe?.comments?.length === 1 ? 'comment' : 'comments'
          }}
        </p>
      </div>
      <PagesRecipeCommentSection></PagesRecipeCommentSection>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const recipeStore = useRecipeStore();
const id = Number(route.params.id);

if (id) {
  const { data } = await useRecipe({
    eq: { id },
  });
  recipeStore.setRecipe(data.value as RecipeProcessed);
}

useHead({
  title: recipeStore.recipe?.title + ' | Rezeptor',
});
</script>
