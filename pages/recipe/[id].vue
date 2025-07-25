<template>
  <PagesRecipeLayout :key="String(route.params.id)">
    <template #image>
      <img
        :src="recipeStore.recipe?.picture ?? undefined"
        class="aspect-square object-cover transition-transform duration-700 group-hover:scale-105 rounded-xl"
      />
    </template>

    <template #title>
      <h1 class="font-bold text-5xl">{{ recipeStore.recipe?.title }}</h1>
    </template>

    <template #user-row>
      <div class="flex items-center gap-2" v-if="recipeStore.recipe?.user">
        <Avatar :user="recipeStore.recipe?.user" class="w-8 h-8"/>
        <span class="text-sm">{{ recipeStore.recipe?.user?.username }} · {{ timeAgo(recipeStore.recipe?.created_at) }}</span>
      </div>
    </template>

    <template #rating>
      <FormsRatingField
        v-if="recipeStore.recipe?.rating"
        v-model="recipeStore.recipe.rating"
        :select="false"
        :star-width="26"
        :star-height="26"
        :spacing="-2"
        :id="250"
      ></FormsRatingField>
      <span class="text-lg">{{ recipeStore.recipe?.rating?.toFixed(1) }}</span>
    </template>

    <template #tags>
      <div
        class="tag metallic-gradient-simple"
        v-for="tag in recipeStore.recipe?.tags"
      >
        {{ getTagByID(tag)?.name }}
      </div>
    </template>

    <template v-if="recipeStore.recipe?.description" #description>
      {{ recipeStore.recipe?.description }}
    </template>

    <template #metadata>
      <div
        class="flex gap-2 items-center justify-center bg-main border-2 border-secondary text-primary rounded-xl p-2 font-bold"
      >
        <span class="material-symbols-outlined"> flash_on </span>
        <span class="text-base"
          >Effort: {{ capitalize(recipeStore.recipe?.effort) }}</span
        >
      </div>
      <div
        class="flex gap-2 items-center justify-center bg-main border-2 border-secondary text-primary rounded-xl p-2 font-bold"
      >
        <span class="material-symbols-outlined"> target </span>
        <span class="text-base"
          >Difficulty: {{ capitalize(recipeStore.recipe?.difficulty) }}</span
        >
      </div>
      <div
        class="flex gap-2 items-center justify-center bg-main border-2 border-secondary text-primary rounded-xl p-2 font-bold"
      >
        <span class="material-symbols-outlined"> attach_money </span>
        <span class="text-base"
          >Estimated Price: {{ formatMoney(recipeStore.recipe?.price) }}</span
        >
      </div>
    </template>

    <template #actions>
      <button
        class="flex button bg-main p-2 font-bold gap-1 items-center shadow-md text-primary"
      >
        <span class="material-symbols-outlined !text-[20px]">share</span>
        <span class="">Share</span>
      </button>
      <button
        class="flex button bg-main p-2 font-bold gap-1 items-center shadow-md text-primary"
      >
        <span class="material-symbols-outlined !text-[20px]">print</span>
        <span class="">Print</span>
      </button>
      <NuxtLink
        :to="{ path: '/recipe/new', query: { editCurrent: 'true' } }"
        class="flex button bg-main p-2 font-bold gap-1 items-center shadow-md text-primary"
      >
        <span class="material-symbols-outlined !text-[20px]">edit</span>
        <span class="">Edit</span>
      </NuxtLink>
      <button
        class="flex button bg-main p-2 font-bold gap-1 items-center shadow-md text-primary"
      >
        <span class="material-symbols-outlined !text-[20px]">delete</span>
        <span class="">Delete</span>
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

    <template #nutrition>
      <PagesRecipeNutriCard :recipe="recipeStore.recipe" />
    </template>

    <template #comments>
      <div class="flex flex-col items-center w-full gap-2">
        <h2 class="text-5xl mt-8">What others say</h2>
        <div class="">
          {{ recipeStore.recipe?.comments?.length }}
          {{
            recipeStore.recipe?.comments?.length === 1 ? 'comment' : 'comments'
          }}
        </div>
        <PagesRecipeCommentSection></PagesRecipeCommentSection>
      </div>
    </template>
  </PagesRecipeLayout>
</template>

<script setup lang="ts">
const route = useRoute();
const recipeStore = useRecipeStore();

const { data: recipe } = await useRecipe({
  eq: { id: Number(route.params.id) },
});

recipeStore.setRecipe(recipe.value as RecipeProcessed);

useHead({
  title: recipeStore.recipe?.title + ' | Rezeptor',
});
</script>

<style scoped>
.tape {
  background: linear-gradient(
    45deg,
    rgb(254, 243, 199) 0%,
    rgb(253, 230, 138) 100%
  );
  border-radius: 2px;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 2px inset;
}
</style>
