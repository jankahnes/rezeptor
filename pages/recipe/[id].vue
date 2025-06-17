<template>
  <div class="p-4 sm:p-10 max-w-[1400px] mx-auto font-sans text-[#662007]">
    <div
      class="grid grid-cols-1 xl:grid-cols-[3fr_7fr] grid-rows-[auto_auto] gap-4"
    >
      <figure
        class="mx-auto aspect-square w-full h-full max-h-[500px] max-w-[500px] p-4 shadow-[0_0_50px_-12px_rgba(146,64,14,0.5)] transform rotate-1 hover:rotate-0 transition-transform duration-500 relative group rounded-2xl bg-[#fdf5ea]"
      >
        <img
          :src="imageUrl"
          class="aspect-square object-cover transition-transform duration-700 group-hover:scale-105 rounded-xl"
        />
        <div
          class="absolute -top-3 left-1/4 w-[15%] h-[8%] transform -rotate-12 tape"
        ></div>
        <div
          class="absolute -top-3 right-1/4 w-[15%] h-[8%] transform rotate-12 tape"
        ></div>
      </figure>
      <div class="grid grid-cols-1 md:grid-cols-[8fr_1fr] gap-4 p-7">
        <div
          class="flex flex-col justify-between h-full gap-4 text-center md:text-left items-center md:items-start"
        >
          <div
            class="flex flex-col gap-3 items-center md:items-start justify-between"
          >
            <div
              class="flex justify-center md:justify-start gap-6 items-center w-full"
            >
              <h1 class="font-bold text-5xl">{{ recipe?.title }}</h1>
            </div>
            <div class="flex items-center gap-3">
              <FormsRatingField
                v-if="recipe?.rating"
                v-model="recipe.rating"
                :select="false"
                :star-width="26"
                :star-height="26"
                :spacing="0"
                :id="250"
              ></FormsRatingField>
              <span class="text-lg">{{ recipe?.rating }}</span>
            </div>
            <div
              class="flex flex-wrap gap-2 items-center gap-y-1 justify-center md:justify-start"
            >
              <Tag class="" v-for="tag in tags" :id="tag.tag_id" />
            </div>
            <div
              class="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 lg:w-[80%] shadow-lg transform relative font-[Gloria_Hallelujah] text-sm text-[#7B3306] desc"
            >
              A creamy, refreshing mango dessert made with just a few simple
              ingredients. Perfect for summer!
            </div>
          </div>
          <div
            class="flex gap-4 gap-y-1 items-center flex-wrap justify-center md:justify-start"
          >
            <div
              class="flex gap-2 items-center justify-center bg-[#DBFCE7] border-[#98E9AF] text-[#008236] border-3 rounded-xl p-2 font-sans font-bold shadow-lg"
            >
              <span class="material-symbols-outlined"> flash_on </span>
              <span class="text-base"
                >Effort: {{ capitalize(recipe?.effort) }}</span
              >
            </div>
            <div
              class="flex gap-2 items-center justify-center bg-[#DBFCE7] border-[#98E9AF] text-[#008236] border-3 rounded-xl p-2 font-sans font-bold shadow-lg"
            >
              <span class="material-symbols-outlined"> target </span>
              <span class="text-base"
                >Difficulty: {{ capitalize(recipe?.difficulty) }}</span
              >
            </div>
            <div
              class="flex gap-2 items-center justify-center bg-[#DBFCE7] border-[#98E9AF] text-[#008236] border-3 rounded-xl p-2 font-bold shadow-lg"
            >
              <span class="material-symbols-outlined"> attach_money </span>
              <span class="text-base"
                >Estimated Price: {{ formatMoney(recipe?.price) }}</span
              >
            </div>
          </div>
        </div>
        <div class="flex justify-between md:justify-start md:flex-col gap-3">
          <button
            class="select-none text-[#FF6900] border-2 border-[#FF6900] rounded-xl px-4 py-2 flex items-center gap-3 bg-white hover:bg-[#fcf8f5] md:rotate-3 transform hover:rotate-1 transition-all duration-100 focus:ring-2 font-[Caveat_Brush] focus:ring-orange-300 focus:ring-offset-2 shadow-lg shadow-orange-300/30"
          >
            <span class="material-icons !text-[20px]">share</span>
            <span class="">Share</span>
          </button>
          <button
            class="select-none text-[#FF6900] border-2 border-[#FF6900] rounded-xl px-4 py-2 flex items-center gap-3 bg-white hover:bg-[#fcf8f5] md:rotate-3 transform hover:rotate-1 transition-all duration-100 focus:ring-2 font-[Caveat_Brush] focus:ring-orange-300 focus:ring-offset-2 shadow-lg shadow-orange-300/30"
          >
            <span class="material-icons !text-[20px]">print</span>
            <span class="">Print</span>
          </button>
        </div>
      </div>
    </div>
    <div class="max-w-[1200px] mx-auto mt-10">
      <div class="grid grid-cols-1 xl:grid-cols-[2fr_3fr] gap-12">
        <PagesRecipeIngredientList
          v-if="!recipeInfoLoading"
          :ingredients="ingredients"
        ></PagesRecipeIngredientList
        >
        <PagesRecipeInstructionContainer
          v-if="!recipeInfoLoading"
          :instructions="recipe?.instructions"
        ></PagesRecipeInstructionContainer>
      </div>
      <div class="flex flex-col items-center mt-10 gap-10">
        <PagesRecipeNutriCard v-if="!recipeInfoLoading" :recipe="recipe" />

        <div class="flex gap-2 items-start justify-center flex-wrap">
          <button
            v-for="button in buttons"
            class="relative rounded-xl p-[3px] overflow-hidden inline-flex items-center w-max"
            @click="button.function()"
          >
            <FormsAIBorder class="rounded-xl" :spinning="button.loading" />
            <span
              class="relative flex bg-[#fffefc] rounded-[9px] w-full items-center justify-center gap-2 px-4 py-2 font-bold"
            >
              <span
                v-if="button.label === 'Chat'"
                class="material-symbols-outlined"
                >chat</span
              >
              <span v-else class="material-symbols-outlined">wand_stars</span>
              <textarea
                class="resize-none h-6 items-center focus:outline-none"
                v-if="button.label === 'User'"
                placeholder="Do this!"
                @input="autoResize($event, 10)"
              ></textarea>
              <textarea
                class="resize-none h-6 focus:outline-none"
                v-else-if="button.label === 'Chat'"
                placeholder="Ask anything"
                @input="autoResize($event, 10)"
              ></textarea>
              <span class="" v-else>{{ button.label }}</span>
            </span>
          </button>
        </div>
      </div>
    </div>
    <PagesRecipeCommentSection
      v-if="!recipeInfoLoading"
      :comments="comments"
      :recipeID="recipe?.id"
    ></PagesRecipeCommentSection>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabase();
const auth = useAuthStore();

const recipe = ref(null);
const ingredients = ref([]);
const tags = ref([]);
const recipeInfoLoading = ref(true);
const imageUrl = ref('');
const comments = ref([]);

const handleMissingIngredients = () => {
  // TODO: Implement missing ingredients functionality
  console.log('Handling missing ingredients');
};

const handleAdaptDiet = () => {
  // TODO: Implement diet adaptation functionality
  console.log('Adapting to diet');
};

const handleMakeHealthier = () => {
  // TODO: Implement make healthier functionality
  console.log('Making recipe healthier');
};

const handleMakeCheaper = () => {
  // TODO: Implement make cheaper functionality
  console.log('Making recipe cheaper');
};

const handleMakeFlavorful = () => {
  // TODO: Implement make flavorful functionality
  console.log('Making recipe more flavorful');
};

const doWhatever = () => {
  // TODO: Implement make flavorful functionality
  console.log('Making recipe more flavorful');
};

const askWhatever = () => {
  // TODO: Implement make flavorful functionality
  console.log('Making recipe more flavorful');
};

const buttons = ref([
  {
    label: 'I am missing ingredients',
    function: handleMissingIngredients,
    loading: false,
  },
  { label: 'Adapt this to my Diet', function: handleAdaptDiet, loading: false },
  {
    label: 'Make this healthier',
    function: handleMakeHealthier,
    loading: false,
  },
  { label: 'Make this cheaper', function: handleMakeCheaper, loading: false },
  {
    label: 'Make this more flavorful',
    function: handleMakeFlavorful,
    loading: false,
  },
  { label: 'User', function: doWhatever, loading: false },
  { label: 'Chat', function: askWhatever, loading: false },
]);

onMounted(async () => {
  const route = useRoute();
  const recipeId = route.params.id;

  recipeInfoLoading.value = true;

  const { data: recipeData, error: recipeError } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', recipeId)
    .single();

  if (recipeError) {
    console.error('Failed to load recipe:', recipeError);
    recipeInfoLoading.value = false;
    return;
  }
  recipe.value = recipeData;

  const { data: ingredientData, error: foodError } = await supabase
    .from('recipe_foods')
    .select(
      `
      amount,
      unit,
      food:foods (
        id, name, price, density, unit_weight, unit_name, measurements
      ),
      category
    `
    )
    .eq('recipe_id', recipeId);
  if (foodError) {
    console.error('Failed to load ingredients:', foodError);
  } else {
    ingredients.value = ingredientData.map((row) => ({
      ...row.food,
      category: row.category,
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

  comments.value = await getCommentsByRecipe(Number(recipeId));
  if (auth.user?.id) {
    comments.value.filter((comment) => {
      comment.user_id != auth.user.id || comment.replying_to;
    });
  }

  recipeInfoLoading.value = false;
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
