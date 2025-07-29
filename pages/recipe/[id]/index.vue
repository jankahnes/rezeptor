<template>
  <PagesRecipeLayout :key="String(route.params.id)">
    <template #image>
      <img
        :src="recipeStore.recipe?.picture ?? undefined"
        class="w-full h-full object-cover transform transition-all duration-550 hover:scale-105"
      />
    </template>

    <template #title>
      <h1 class="font-bold text-3xl lg:text-5xl text-gray-900">
        {{ recipeStore.recipe?.title }}
      </h1>
    </template>

    <template #user-row>
      <div class="flex items-center gap-2" v-if="recipeStore.recipe?.user">
        <Avatar :user="recipeStore.recipe?.user as any" class="w-8 h-8" />
        <span class="text-sm text-gray-600"
          >{{ recipeStore.recipe?.user?.username }} ·
          {{ timeAgo(recipeStore.recipe?.created_at) }}</span
        >
      </div>
    </template>

    <template #rating>
      <FormsRatingField
        v-if="recipeStore.recipe?.rating"
        v-model="recipeStore.recipe.rating"
        :select="false"
        :star-width="24"
        :star-height="24"
        :spacing="-2"
        :id="250"
      ></FormsRatingField>
      <span class="text-lg font-semibold text-gray-700">{{
        recipeStore.recipe?.rating?.toFixed(1)
      }}</span>
    </template>

    <template #tags>
      <div
        class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-primary-50 to-primary-100 text-primary"
        v-for="tag in recipeStore.recipe?.tags"
        :key="tag"
      >
        {{ getTagByID(tag)?.name }}
      </div>
    </template>

    <template v-if="recipeStore.recipe?.description" #description>
      {{ recipeStore.recipe?.description }}
    </template>

    <template #metadata>
      <div class="flex items-center gap-3 rounded-xl transition-colors">
        <span class="material-symbols-outlined text-primary"> flash_on </span>
        <div class="flex flex-col min-w-0">
          <span
            class="text-xs font-medium text-gray-500 uppercase tracking-wide;"
            >Effort</span
          >
          <span class="text-sm font-semibold text-gray-900 truncate">{{
            capitalize(recipeStore.recipe?.effort)
          }}</span>
        </div>
      </div>
      <div class="flex items-center gap-3 rounded-xl transition-colors">
        <span class="material-symbols-outlined text-primary"> target </span>
        <div class="flex flex-col min-w-0">
          <span
            class="text-xs font-medium text-gray-500 uppercase tracking-wide;"
            >Difficulty</span
          >
          <span class="text-sm font-semibold text-gray-900 truncate">{{
            capitalize(recipeStore.recipe?.difficulty)
          }}</span>
        </div>
      </div>
      <div class="flex items-center gap-3 transition-colors">
        <span class="material-symbols-outlined text-primary">
          attach_money
        </span>
        <div class="flex flex-col min-w-0">
          <span
            class="text-xs font-medium text-gray-500 uppercase tracking-wide;"
            >Price</span
          >
          <span class="text-sm font-semibold text-gray-900 truncate">{{
            formatMoney(recipeStore.recipe?.price)
          }}</span>
        </div>
      </div>
    </template>

    <template #actions>
      <button
        class="button flex items-center gap-2 px-4 py-1 font-medium text-primary-800"
      >
        <span class="material-symbols-outlined !text-lg">share</span>
        <span>Share</span>
      </button>
      <button
        class="button flex items-center gap-2 px-4 py-1 font-medium text-primary-800"
      >
        <span class="material-symbols-outlined !text-lg">print</span>
        <span>Print</span>
      </button>
      <NuxtLink
        :to="{ path: '/recipe/new', query: { editCurrent: 'true' } }"
        class="button flex items-center gap-2 px-4 py-1 font-medium text-primary-800"
      >
        <span class="material-symbols-outlined !text-lg">edit</span>
        <span>Edit</span>
      </NuxtLink>
      <button
        class="button flex items-center gap-2 px-4 py-1 font-medium text-primary-800"
      >
        <span class="material-symbols-outlined !text-lg">delete</span>
        <span>Delete</span>
      </button>
    </template>

    <template #ingredients>
      <PagesRecipeIngredientList
        :ingredients="recipeStore.recipe?.ingredients"
      ></PagesRecipeIngredientList>
    </template>

    <template #instructions>
      <PagesRecipeInstructionContainer
        v-if="recipeStore.recipe?.instructions"
        :instructions="recipeStore.recipe.instructions"
      ></PagesRecipeInstructionContainer>
    </template>

    <template #nutrition-label>
        <NutritionLabel :recipe="recipeStore.recipe" class="flex-1" />
    </template>

    <template #health-facts>
        <HealthFacts :recipe="recipeStore.recipe" class="flex-1" />
    </template>

    <template #comments>
      <div class="flex flex-col items-center w-full gap-6">
        <div class="text-center">
          <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            What others say
          </h2>
          <p class="text-gray-600">
            {{ recipeStore.recipe?.comments?.length }}
            {{
              recipeStore.recipe?.comments?.length === 1
                ? 'comment'
                : 'comments'
            }}
          </p>
        </div>
        <PagesRecipeCommentSection></PagesRecipeCommentSection>
      </div>
    </template>
  </PagesRecipeLayout>
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

<style scoped>

.tape {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #f59e0b 100%);
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1),
    inset 0 1px 2px rgba(255, 255, 255, 0.3);
}
</style>
