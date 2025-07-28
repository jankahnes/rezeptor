<template>
  <PagesRecipeLayout>
    <template #image>
      <div
        @click="triggerFileInput"
        class="relative cursor-pointer w-full aspect-square rounded-xl overflow-hidden border-2 border-dashed border-gray-400 flex items-center justify-center bg-gray-100 group hover:border-gray-600"
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
          class="material-symbols-outlined !text-8xl text-gray-400 select-none pointer-events-none"
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
    </template>

    <template #title>
      <textarea
        v-model="recipe.title"
        v-auto-resize
        rows="1"
        placeholder="New Recipe"
        class="min-w-0 font-bold text-5xl border-box bg-transparent border-2 border-dashed border-gray-400 rounded-xl p-2 outline-none resize-none overflow-hidden h-auto break-words scrollbar-hide flex-1"
      />
    </template>

    <template #tags>
      <div class="flex gap-5 flex-wrap justify-center relative text-xl">
        <FormsMultiChoiceDropdown
          class="min-w-30"
          v-model="chosenFlavorTags"
          :choices="TAGS.FLAVOR.map((tag) => tag.name)"
          placeholder="Flavors"
          :style="'border-2 border-dashed border-gray-400 rounded-xl p-2 bg-[#fffefc]'"
        />
        <FormsMultiChoiceDropdown
          class="min-w-30"
          v-model="chosenCourseTags"
          :choices="TAGS.COURSE.map((tag) => tag.name)"
          placeholder="Course"
          :style="'border-2 border-dashed border-gray-400 rounded-xl p-2 bg-[#fffefc]'"
        />
        <FormsMultiChoiceDropdown
          class="min-w-30"
          v-model="chosenCuisineTags"
          :choices="TAGS.CUISINE.map((tag) => tag.name)"
          placeholder="Cuisine"
          :style="'border-2 border-dashed border-gray-400 rounded-xl p-2 bg-[#fffefc]'"
        />
      </div>
    </template>

    <template #description>
      <textarea
        v-model="recipe.description"
        v-auto-resize
        rows="1"
        placeholder="Description"
        class="w-full bg-transparent border-2 border-dashed border-gray-400 rounded-xl p-2 outline-none resize-none overflow-hidden h-auto break-words scrollbar-hide flex-1"
      ></textarea>
    </template>

    <template #metadata>
      <div
        class="flex gap-2 items-center justify-center bg-[#DBFCE7] border-[#98E9AF] text-[#008236] border-3 border-dashed rounded-xl p-2 font-bold shadow-lg select-none cursor-pointer"
        @click="onClickEffort"
      >
        <span class="material-symbols-outlined"> flash_on </span>
        <span class="text-base">Effort: {{ capitalize(recipe?.effort) }}</span>
        <span class="material-symbols-outlined" v-if="recipe.effort === null">
          touch_app
        </span>
      </div>
      <div
        class="flex gap-2 items-center justify-center bg-[#DBFCE7] border-[#98E9AF] text-[#008236] border-3 border-dashed rounded-xl p-2 font-bold shadow-lg select-none cursor-pointer"
        @click="onClickDifficulty"
      >
        <span class="material-symbols-outlined"> target </span>
        <span class="text-base"
          >Difficulty: {{ capitalize(recipe?.difficulty) }}</span
        >
        <span
          class="material-symbols-outlined"
          v-if="recipe.difficulty === null"
        >
          touch_app
        </span>
      </div>
      <div
        class="flex gap-2 items-center justify-center bg-[#DBFCE7] border-[#98E9AF] text-[#008236] border-3 border-dashed rounded-xl p-2 font-bold shadow-lg select-none cursor-pointer"
        @click="onClickVisibility"
      >
        <span class="material-symbols-outlined"> visibility </span>
        <span class="text-base"
          >Visibility: {{ capitalize(recipe?.visibility) }}</span
        >
        <span
          class="material-symbols-outlined"
          v-if="recipe.visibility === null"
        >
          touch_app
        </span>
      </div>
      <div
        class="flex gap-2 items-center justify-center bg-[#DBFCE7] border-[#98E9AF] text-[#008236] border-3 rounded-xl p-2 font-bold shadow-lg"
      >
        <span class="material-symbols-outlined"> attach_money </span>
        <span class="text-base"
          >Estimated Price: {{ formatMoney(recipeComputed?.price) }}</span
        >
      </div>
    </template>

    <template #ingredients>
      <PagesRecipeIngredientListEditable
        v-model="recipe.ingredients_editable"
      ></PagesRecipeIngredientListEditable>
    </template>

    <template #instructions>
      <PagesRecipeInstructionContainerEditable
        v-model="recipe.instructions"
      ></PagesRecipeInstructionContainerEditable>
    </template>

    <template #nutrition>
      <div class="flex justify-center">
        <div class="flex flex-col gap-4 items-end">
          <div class="flex-1">
            <PagesRecipeNutriCard :recipe="recipeComputed" />
          </div>
          <button
            @click="onClickReport"
            class="flex items-center gap-2 px-4 py-1 font-medium text-primary-800"
          >
            <span class="material-symbols-outlined text-lg">open_in_new</span>
            <span>Detailed Report</span>
          </button>
        </div>
      </div>
    </template>
  </PagesRecipeLayout>
  <div class="my-22"></div>
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
</template>

<script setup>
const efforts = ['LIGHT', 'MODERATE', 'HEAVY'];
const difficulties = ['EASY', 'MEDIUM', 'HARD'];
const visibilities = ['PUBLIC', 'UNLISTED', 'PRIVATE'];
const chosenFlavorTags = ref([]);
const chosenCourseTags = ref([]);
const chosenCuisineTags = ref([]);

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

const recipe = ref({
  title: '',
  description: '',
  ingredients_editable: {
    servingSize: 1,
    ingredients: [
      {
        categoryName: 'uncategorized',
        ingredients: [],
        searchQuery: '',
        searchResults: [],
      },
    ],
  },
  instructions: [],
  tags: [],
  effort: null,
  difficulty: null,
  visibility: null,
});

const recipeComputed = ref({});

function onClickReport() {
  recipeStore.setRecipe(recipe.value);
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
          ingredients: [],
          searchQuery: '',
          searchResults: [],
        },
      ];
    }
    imageUrl.value = recipe.value.picture;
  } else {
    isEditing.value = false;
  }
  compute();
});

const getTagIdByName = (category, name) => {
  const tag = TAGS[category].find((t) => t.name === name);
  return tag ? tag.id : null;
};

function onClickEffort() {
  if (recipe.value.effort === null) {
    recipe.value.effort = efforts[0];
  } else {
    recipe.value.effort =
      efforts[(efforts.indexOf(recipe.value.effort) + 1) % efforts.length];
  }
}
function onClickDifficulty() {
  if (recipe.value.difficulty === null) {
    recipe.value.difficulty = difficulties[0];
  } else {
    recipe.value.difficulty =
      difficulties[
        (difficulties.indexOf(recipe.value.difficulty) + 1) %
          difficulties.length
      ];
  }
}
function onClickVisibility() {
  if (recipe.value.visibility === null) {
    recipe.value.visibility = visibilities[0];
  } else {
    recipe.value.visibility =
      visibilities[
        (visibilities.indexOf(recipe.value.visibility) + 1) %
          visibilities.length
      ];
  }
}

const getTags = () => {
  return [
    ...chosenFlavorTags.value.map((name) => getTagIdByName('FLAVOR', name)),
    ...chosenCourseTags.value.map((name) => getTagIdByName('COURSE', name)),
    ...chosenCuisineTags.value.map((name) => getTagIdByName('CUISINE', name)),
  ].filter((id) => id !== null);
};

async function compute() {
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
    const pictureUrl = await uploadImage(supabase, 'recipe', id, imgFile);

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
    const pictureUrl = await uploadImage(supabase, 'recipe', id, imgFile);
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
    recipeComputed.picture = await uploadImage(
      supabase,
      'recipe',
      originalRecipeId.value,
      imgFile,
      true
    );
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
    await uploadImage(
      supabase,
      'recipe',
      originalRecipeId.value,
      imgFile,
      true
    );
  }
  loadingStep.value = 6;

  return originalRecipeId.value;
};

async function submit() {
  loadingStep.value = 1;
  recipe.value.tags = getTags();
  const calc = new RecipeCalculator(
    JSON.parse(JSON.stringify(recipe.value)),
    true,
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
