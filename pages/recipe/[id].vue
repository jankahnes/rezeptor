<template>
  <div class="pt-10">
    <div
      class="mx-3 md:mx-auto md:max-w-[90%] lg:max-w-[70%] xl:max-w-[85%] min-h-[80vh] sm:p-10 sm:border-4 sm:shadow-[6px_6px_0_0_rgba(0,0,0,1)] card"
    >
      <div class="grid xl:grid-cols-[3fr_7fr] grid-rows-[auto_auto] gap-4">
        <div class="flex items-center justify-center">
          <img :src="imageUrl" class="w-full h-full aspect-square" />
        </div>
        <div class="p-7 flex flex-col justify-between">
          <div class="">
            <div class="flex align-center w-full justify-between">
              <h1 class="font-extrabold text-4xl">{{ recipe?.title }}</h1>
              <div class="flex gap-2 items-center">
                <button
                  class="bg-white text-white border-2 p-1 flex align-center justify-center shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                >
                  <span class="text-black material-icons !text-[20px]"
                    >bookmark</span
                  >
                </button>
                <button
                  class="bg-white text-white border-2 p-1 flex align-center justify-center shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                >
                  <span class="text-black material-icons !text-[20px]"
                    >share</span
                  >
                </button>
              </div>
            </div>

            <div class="stars flex text-xl mt-1 items-center">
              <FormsRatingField
                v-if="recipe?.rating"
                v-model="recipe.rating"
                :select="false"
              ></FormsRatingField>
              <span class="ml-2 text-base">{{ recipe?.rating }}</span>
            </div>
            <div
              class="tag-field gap-x-2 gap-y-2 xl:mt-6 mt-10 xl:w-[70%] items-center flex flex-wrap justify-start"
            >
              <Tag class="border rounded-xl px-1 py-[1px]" v-for="tag in tags" :id="tag.tag_id" />
            </div>
          </div>

          <div class="hidden [@media(min-width:600px)]:block">
            <div class="flex justify-between xl:pt-0 pt-8">
              <div class="flex gap-4 align-center">
                <div
                  class="h-10 w-10 bg-white border-black border-1 flex items-center justify-center"
                >
                  <span class="material-icons text-black !text-2xl"
                    >schedule</span
                  >
                </div>
                <div class="">
                  <p class="text-sm">Effort</p>
                  <p
                    class="text-base font-bold -mt-[3px] whitespace-nowrap overflow-visible"
                  >
                    {{ recipe?.effort }}
                  </p>
                </div>
              </div>
              <div class="flex gap-4 align-center">
                <div
                  class="h-10 w-10 bg-white border-black border-1 flex items-center justify-center"
                >
                  <span class="material-icons text-black !text-2xl">speed</span>
                </div>
                <div>
                  <p class="text-sm">Difficulty</p>
                  <p class="text-base font-bold -mt-[3px]">
                    {{ recipe?.difficulty }}
                  </p>
                </div>
              </div>
              <div class="flex gap-4 align-center">
                <div
                  class="h-10 w-10 bg-white border-black border-1 flex items-center justify-center"
                >
                  <span class="material-icons text-black !text-2xl"
                    >attach_money</span
                  >
                </div>
                <div>
                  <p class="text-sm whitespace-nowrap overflow-visible">
                    Estimated Cost
                  </p>
                  <p class="text-base font-bold -mt-[3px]">
                    {{ recipe?.price.toFixed(2) }}€
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="hidden [@media(max-width:599px)]:block mt-6">
            <div class="flex justify-between w-full">
              <div class="flex items-center gap-2">
                <span class="material-icons text-black !text-2xl"
                  >schedule</span
                >
                <span>{{ recipe?.effort }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="material-icons text-black !text-2xl">speed</span>
                <span>{{ recipe?.difficulty }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="material-icons text-black !text-2xl"
                  >attach_money</span
                >
                <span>{{ recipe?.price.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="">
          <PagesRecipeIngredientList :ingredients="ingredients" />
        </div>
        <div class="px-2 sm:px-7 space-y-10">
          <PagesRecipeInstructionContainer
            :instructions="recipe?.instructions"
          />
          <PagesRecipeNutriCard :recipe="recipe" />
        </div>
      </div>
      <PagesRecipeCommentSection />
    </div>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabase();

const recipe = ref(null);
const ingredients = ref([]);
const tags = ref([]);
const isLoading = ref(true);
const imageUrl = ref('');

onMounted(async () => {
  const route = useRoute();
  const recipeId = route.params.id;

  isLoading.value = true;

  const { data: recipeData, error: recipeError } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', recipeId)
    .single();

  if (recipeError) {
    console.error('Failed to load recipe:', recipeError);
    isLoading.value = false;
    return;
  }
  recipe.value = recipeData;

  // 2. Fetch ingredients with food info
  const { data: ingredientData, error: foodError } = await supabase
    .from('recipe_foods')
    .select(
      `
      amount,
      unit,
      food:foods (
        id, name, avg_price, density, piece_weight, measurements
      )
    `
    )
    .eq('recipe_id', recipeId);
  if (foodError) {
    console.error('Failed to load ingredients:', foodError);
  } else {
    ingredients.value = ingredientData.map((row) => ({
      ...row.food,
      amountInfo: [[row.amount, row.unit]],
    }));
  }
  for (const ingredient of ingredients.value) {
    ingredient.possibleUnits = getPossibleUnits(ingredient.measurements);
    ingredient.currentUnit = 0;
    fillForUnits(ingredient);
  }

  // 3. Fetch tags
  const { data: tagData, error: tagError } = await supabase
    .from('recipe_tags')
    .select('tag_id')
    .eq('recipe_id', recipeId);

  if (tagError) {
    console.error('Failed to load tags:', tagError);
  } else {
    tags.value = tagData;
  }

  if (recipe.value.picture_ext) {
    const { data: publicUrlData } = supabase.storage
      .from('recipe')
      .getPublicUrl(`${recipeId}.${recipe.value.picture_ext}`);

    imageUrl.value = publicUrlData.publicUrl;
  }

  isLoading.value = false;
});
</script>

<style scoped>
@media (min-width: 640px) {
  .card {
    background: radial-gradient(
      ellipse at center,
      #f0ece477 0%,
      #f5efe17c 80%,
      #ece4ce7e 100%
    );
  }
}
</style>
