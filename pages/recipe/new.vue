<template>
  <div class="flex justify-center">
    <div class="max-w-screen-lg mx-auto p-4 space-y-4">
      <div
        @click="triggerFileInput"
        class="relative cursor-pointer w-75 max-w-1/2 aspect-square rounded-xl overflow-hidden flex items-center justify-center bg-gray-100 group"
      >
        <input
          ref="imgUpload"
          type="file"
          accept="image/*"
          class="hidden"
          @change="onFileChange"
        />

        <span
          v-if="!imageUrl"
          class="material-symbols-outlined !text-6xl text-gray-400 select-none pointer-events-none"
        >
          photo_camera
        </span>

        <img
          v-else
          :src="imageUrl"
          alt="Uploaded photo preview"
          class="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      <textarea
        v-model="recipe.title"
        v-auto-resize
        rows="1"
        placeholder="New Recipe"
        class="w-full font-bold text-3xl border-box bg-transparent rounded-xl p-2 outline-none resize-none overflow-hidden h-auto break-words scrollbar-hide flex-1"
      />

      <textarea
        v-model="recipe.description"
        v-auto-resize
        rows="1"
        placeholder="Description"
        class="w-full bg-transparent rounded-xl p-2 outline-none resize-none overflow-hidden h-auto break-words scrollbar-hide flex-1 text-sm"
      ></textarea>
      <div class="flex gap-10 mt-6 mx-auto flex-wrap">
        <PagesRecipeIngredientListEditable
          v-model="recipe.ingredients_editable"
        ></PagesRecipeIngredientListEditable>

        <PagesRecipeInstructionContainerEditable
          v-model="recipe.instructions"
        ></PagesRecipeInstructionContainerEditable>

        <NutritionLabel
          v-if="displayInfo"
          :recipe="recipeComputed"
          class="flex-1"
        />

        <HealthFacts
          v-if="displayInfo"
          :recipe="recipeComputed"
          :on-report="onClickReport"
          class="flex-1"
        />
      </div>
    </div>
    <div
      class="fixed bottom-22 xm:bottom-6 xm:right-6 z-100 flex gap-2 w-full justify-center xm:w-auto xm:justify-end"
    >
      <button
        class="flex gap-2 items-center justify-center bg-[#DBFCE7] border-[#98E9AF] text-[#008236] border-3 rounded-xl p-2 font-bold shadow-lg"
        @click=""
      >
        <span class="material-symbols-outlined"> visibility </span>
        Preview
      </button>
      <button
        class="flex gap-2 items-center justify-center bg-[#DBFCE7] border-[#98E9AF] text-[#008236] border-3 rounded-xl p-2 font-bold shadow-lg"
        @click="submit()"
      >
        <span v-if="!loadingStep" class="material-symbols-outlined">
          arrow_right_alt
        </span>
        <ClientOnly v-else>
          <Vue3Lottie animationLink="/loading.json" :height="24" :width="24" />
        </ClientOnly>
        Submit
      </button>
    </div>
  </div>
</template>

<script setup>
const imageUrl = ref(null);
const imgUpload = ref(null);
const loadingStep = ref(0);
const originalRecipeId = ref(null);
const originalUserId = ref(null);
const isEditing = ref(false);

const auth = useAuthStore();
const supabase = useSupabaseClient();
const route = useRoute();
const recipeStore = useRecipeStore();

const displayInfo = computed(() => {
  return recipeComputed.value.hidx;
});

const recipe = ref({
  title: '',
  description: '',
  ingredients_editable: {
    servingSize: 1,
    ingredients: [
      {
        categoryName: 'uncategorized',
        ingredients: [
          {
            text: '',
            parsed: [],
          },
        ],
        searchQuery: '',
        searchResults: [],
      },
    ],
  },
  instructions: [],
  effort: null,
  difficulty: null,
  visibility: null,
});

const recipeComputed = ref({});

function onClickReport() {
  recipeStore.setRecipeFromNew(recipe.value);
  navigateTo(`/recipe/new/report`);
}

onMounted(async () => {
  isEditing.value = route.query.editCurrent === 'true';
  if (isEditing.value && useRecipeStore().recipe) {
    const originalRecipe = useRecipeStore().recipe;
    originalRecipeId.value = originalRecipe.id;
    originalUserId.value = originalRecipe.user_id;
    recipe.value = await useRecipeStore().convertToEditable();
    if (!recipe.value.ingredients_editable.ingredients.length) {
      recipe.value.ingredients_editable.ingredients = [
        {
          categoryName: 'uncategorized',
          ingredients: [
            {
              text: '',
              parsed: [],
            },
          ],
          searchQuery: '',
          searchResults: [],
        },
      ];
    }
    imageUrl.value = recipe.value.picture;
  } else if (recipeStore.isEditingNew) {
    recipe.value = recipeStore.recipe;
    imageUrl.value = recipe.value.picture;
  } else {
    isEditing.value = false;
  }
  compute();
});

async function compute() {
  console.log('Called compute');
  const calc = new RecipeCalculator(JSON.parse(JSON.stringify(recipe.value)));
  await calc.computeRecipe();
  recipeComputed.value = calc.recipeComputed;
}

const computeDebounced = debounce(compute, 3000);

watch(recipe, computeDebounced, { deep: true });

const insertRecipeFoods = async (recipeFoods, recipeId) => {
  if (recipeFoods.length) {
    const { error } = await supabase
      .from('recipe_foods')
      .insert(recipeFoods.map((obj) => ({ ...obj, recipe_id: recipeId })));
    if (error) throw error;
  }
};

const insertRecipeTags = async (recipeTags, recipeId) => {
  if (recipeTags.length) {
    const { error } = await supabase
      .from('recipe_tags')
      .insert(recipeTags.map((obj) => ({ ...obj, recipe_id: recipeId })));
    if (error) throw error;
  }
};

const submitNewRecipe = async (recipeComputed, recipeFoods, recipeTags) => {
  const { data, error } = await supabase
    .from('recipes')
    .insert({
      ...recipeComputed,
      user_id: auth?.user?.id ?? null,
      picture: null,
    })
    .select('id')
    .single();
  if (error) throw error;

  loadingStep.value = 3;
  const id = data.id;

  if (imgUpload.value.files && imgUpload.value.files[0]) {
    const imgFile = imgUpload.value.files[0];
    const { data: imageData } = await useImageUpload(
      imgFile,
      'recipe',
      id,
      false
    );
    const pictureUrl = imageData.value?.publicUrl;
    if (!pictureUrl) return;
    const { error: updateError } = await supabase
      .from('recipes')
      .update({ picture: pictureUrl })
      .eq('id', id);
    if (updateError) throw updateError;
  }

  await insertRecipeFoods(recipeFoods, id);
  loadingStep.value = 4;
  await insertRecipeTags(recipeTags, id);
  loadingStep.value = 5;

  loadingStep.value = 6;

  return id;
};

const submitForkRecipe = async (recipeComputed, recipeFoods, recipeTags) => {
  const { data, error } = await supabase
    .from('recipes')
    .insert({
      ...recipeComputed,
      user_id: auth?.user?.id ?? null,
      forked_from: originalRecipeId.value,
      picture: imageUrl.value,
    })
    .select('id')
    .single();
  if (error) throw error;

  loadingStep.value = 3;
  const id = data.id;

  if (imgUpload.value.files && imgUpload.value.files[0]) {
    const imgFile = imgUpload.value.files[0];
    const { data: imageData } = await useImageUpload(
      imgFile,
      'recipe',
      id,
      false
    );
    const pictureUrl = imageData.value?.publicUrl;
    if (!pictureUrl) return;
    const { error: updateError } = await supabase
      .from('recipes')
      .update({ picture: pictureUrl })
      .eq('id', id);
    if (updateError) throw updateError;
  }

  await insertRecipeFoods(recipeFoods, id);
  loadingStep.value = 4;
  await insertRecipeTags(recipeTags, id);
  loadingStep.value = 5;

  return id;
};

const submitEditOwnRecipe = async (recipeComputed, recipeFoods, recipeTags) => {
  let imgFile = null;
  if (imgUpload.value.files && imgUpload.value.files[0]) {
    imgFile = imgUpload.value.files[0];
    const { data: imageData } = await useImageUpload(
      imgFile,
      'recipe',
      originalRecipeId.value,
      true
    );
    recipeComputed.picture = imageData.value?.publicUrl;
  } else {
    recipeComputed.picture = imageUrl.value;
  }

  const { error: updateError } = await supabase
    .from('recipes')
    .update({
      ...recipeComputed,
    })
    .eq('id', originalRecipeId.value);
  if (updateError) throw updateError;

  loadingStep.value = 3;

  await supabase
    .from('recipe_foods')
    .delete()
    .eq('recipe_id', originalRecipeId.value);

  await supabase
    .from('recipe_tags')
    .delete()
    .eq('recipe_id', originalRecipeId.value);

  await insertRecipeFoods(recipeFoods, originalRecipeId.value);
  loadingStep.value = 4;
  await insertRecipeTags(recipeTags, originalRecipeId.value);
  loadingStep.value = 5;

  if (imgFile) {
    const { data: imageData } = await useImageUpload(
      imgFile,
      'recipe',
      originalRecipeId.value,
      true
    );
    recipeComputed.picture = imageData.value?.publicUrl;
  }
  loadingStep.value = 6;

  return originalRecipeId.value;
};

async function submit() {
  loadingStep.value = 1;
  const calc = new RecipeCalculator(
    JSON.parse(JSON.stringify(recipe.value)),
    true,
    false,
    false,
    false
  );
  await calc.computeRecipe();
  recipeComputed.value = stripKeys(calc.recipeComputed, recipeKeys);
  const recipeFoodsRows = calc.getRecipeFoodRows();
  const recipeTagsRows = calc.getRecipeTagRows();
  loadingStep.value = 2;

  let resultId;

  if (!isEditing.value) {
    resultId = await submitNewRecipe(
      recipeComputed.value,
      recipeFoodsRows,
      recipeTagsRows
    );
  } else if (auth?.user?.id === originalUserId.value) {
    resultId = await submitEditOwnRecipe(
      recipeComputed.value,
      recipeFoodsRows,
      recipeTagsRows
    );
  } else {
    resultId = await submitForkRecipe(
      recipeComputed.value,
      recipeFoodsRows,
      recipeTagsRows
    );
  }

  navigateTo(`/recipe/${resultId}`);
}

function triggerFileInput() {
  imgUpload.value?.click();
}

function onFileChange(event) {
  const file = event.target.files[0];
  if (!file) return;
  imageUrl.value = URL.createObjectURL(file);
}
</script>

<style scoped></style>
