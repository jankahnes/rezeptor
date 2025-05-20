<template>
  <div
    class="px-5 sm:px-10 pt-10 m-auto flex flex-col items-center max-w-[1200px] w-full"
  >
    <div class="flex gap-2 items-center">
      <span class="material-symbols-outlined mt-1"> stars_2 </span>
      <h1 class="font-bold !text-2xl">Create a new recipe</h1>
    </div>
    <div
      class="papyrus-gradient w-full min-h-[60vh] sm:shadow-[4px_4px_0_0_rgba(0,0,0,1)] border-dashed border-1 sm:border-3 sm:border-solid px-3 py-10 m-5 sm:bg-none"
    >
      <div
        class="flex flex-col items-center gap-4 pt-10 h-full"
        v-if="step === 1"
      >
        <!-- Step 1: Title -->
        <h2 class="text-xl font-bold">Choose a title:</h2>
        <input
          v-model="recipe.title"
          class="bg-white shadow-[2px_2px_0_0_rgba(0,0,0,1)] border-2 w-[95%] sm:w-[60%] text-2xl font-bold focus:outline-none px-2 text-center"
          placeholder=""
          @keydown.enter="next"
        />
        <div
          v-if="recipeSearchResults.length > 0"
          class="font-light flex flex-col items-center mx-10 text-center"
        >
          <h3>
            Start from scratch or use an existing recipe as a starting point:
          </h3>
          <button
            v-for="result in recipeSearchResults"
            class="p-2 flex items-center gap-3 border-dashed border min-w-[50%] mt-2"
          >
            <span class="material-symbols-outlined"
              >subdirectory_arrow_right</span
            >
            <span>{{ result }}</span>
          </button>
        </div>
        <button
          class="bg-white border-2 p-1 !text-lg shadow-[3px_3px_0_0_rgba(0,0,0,1)] mt-10 w-20"
          @click="next"
        >
          Submit
        </button>
      </div>
      <div class="flex-col flex items-center w-full" v-if="step === 2">
        <div
          class="grid lg:grid-cols-[1fr_1fr] py-3 sm:p-3 gap-10 h-full w-full"
        >
          <div class="flex flex-col gap-3 h-full w-full">
            <h2 class="text-xl font-bold text-center">Add ingredients</h2>
            <div class="w-full flex-col flex gap-2 sm:p-2 items-center">
              <div
                v-for="ingredient in recipe.ingredients"
                class="flex w-full bg-white gap-2 min-h-10"
              >
                <div class="flex-1 w-0 min-w-0 border px-2 flex items-center">
                  <span
                    class="block whitespace-nowrap hide-scrollbar overflow-auto sm:truncate"
                  >
                    {{ ingredient.name }}
                  </span>
                </div>

                <input
                  class="flex-none h-full text-lg text-center bg-white border min-w-10"
                  v-model="ingredient.amount"
                  :style="{ width: ingredient.amount.length + 2 + 'ch' }"
                />

                <div class="flex-none relative">
                  <FormsDropdown
                    :thin="true"
                    :choices="ingredient.possibleUnits"
                    v-model="ingredient.unit"
                  />
                </div>

                <button
                  class="flex-none flex items-center justify-center border aspect-square"
                  @click="removeIngredient(ingredient.id)"
                >
                  <span class="material-symbols-outlined">remove</span>
                </button>
              </div>
              <div v-if="ingredientLookup" class="w-full space-y-3">
                <div class="flex gap-2">
                  <div
                    class="flex items-center w-full border h-8 px-2 bg-white"
                  >
                    <span class="material-symbols-outlined"> search </span>
                    <input
                      v-model="ingredientQuery"
                      class="w-full focus:outline-none p-2"
                    />
                  </div>
                  <button
                    class="border w-9 h-8 bg-white flex justify-center items-center"
                    @click="ingredientLookup = false"
                  >
                    <span class="material-symbols-outlined"> close </span>
                  </button>
                </div>
                <div
                  class="w-full h-50 bg-white border flex flex-col justify-between p-1"
                >
                  <div class="w-full p-2 overflow-auto">
                    <button
                      class="w-full py-2"
                      v-for="food in foodSearchResults"
                      @click="addIngredient(food)"
                    >
                      {{ food.name }}
                    </button>
                  </div>
                  <div
                    class="text-[10px] w-full flex flex-col items-center font-light"
                  >
                    <p>Can't find what you're looking for?</p>
                    <p class="underline">Create a ingredient yourself -></p>
                  </div>
                </div>
              </div>
              <div
                v-else
                class="w-full gap-3 flex items-center justify-center mt-4"
              >
                <div class="border-2 p-[2px] w-20">
                  <button
                    class="bg-white p-2 border w-full h-full flex items-center justify-center"
                    @click="ingredientLookup = true"
                  >
                    <span class="material-symbols-outlined"> add </span>
                  </button>
                </div>
                <div class="border-2 p-[2px] w-20">
                  <button
                    class="bg-white p-2 border w-full h-full flex items-center justify-center"
                  >
                    <span class="material-symbols-outlined"> barcode </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="flex flex-col gap-3 h-full items-center">
            <div class="flex items-end gap-1 w-full justify-center">
              <h2 class="text-xl font-bold">Add instructions</h2>
              <span class="font-light text-sm mb-[2px]">(Optional)</span>
            </div>

            <div class="w-full flex-col flex gap-2 p-2">
              <div
                v-for="(instruction, index) in recipe.instructions"
                :key="index"
                class="flex items-start min-h-6 gap-2"
              >
                <button
                  @click="removeInstruction(index)"
                  class="h-10 w-10 bg-white aspect-square p-2 text-2xl font-bold border-2 shadow-[2px_2px_0_0_rgba(0,0,0,1)] flex items-center justify-center group transition-colors duration-200 hover:bg-black"
                >
                  <span
                    class="absolute transition-opacity duration-200 group-hover:opacity-0"
                  >
                    {{ index + 1 }}
                  </span>

                  <span
                    class="absolute opacity-0 group-hover:opacity-100 duration-200 text-white material-symbols-outlined"
                  >
                    remove
                  </span>
                </button>
                <textarea
                  v-model="recipe.instructions[index]"
                  class="bg-white h-10 flex-grow p-1 border flex-wrap resize-none overflow-hidden leading-snug"
                  rows="1"
                  @input="autoResize($event)"
                />
              </div>

              <button
                @click="addInstruction"
                class="bg-white h-10 w-10 p-2 text-2xl font-bold border flex items-center justify-center"
              >
                <span class="material-symbols-outlined"> add </span>
              </button>
            </div>
          </div>
        </div>
        <button
          class="bg-white border-2 p-1 w-20 !text-lg shadow-[3px_3px_0_0_rgba(0,0,0,1)] mt-22"
          @click="next"
        >
          Submit
        </button>
      </div>
      <div
        class="flex flex-col gap-2 items-center w-full overflow-hidden"
        v-if="step === 3"
      >
        <!-- Step 3: Tags, options -->
        <div class="flex w-full justify-between items-center md:px-15">
          <div>
            <h2 class="text-lg">Add fitting tags</h2>
            <p class="text-sm font-light">
              Cuisine, type, cooking method, flavor profile...
            </p>
          </div>
          <span class="material-symbols-outlined"> info </span>
        </div>
        <div class="flex justify-start w-full md:px-15">
          <TagRowSelect class="w-full" v-model="recipe.tags" />
        </div>

        <div
          class="flex w-full justify-center mt-8 gap-x-20 gap-y-5 flex-wrap select-none"
        >
          <div class="flex flex-col items-center">
            <h3 class="text-lg">Difficulty</h3>
            <FormsChoiceSlider
              class="mt-1"
              v-model="recipe.difficulty"
              :choices="[
                ['Easy', ''],
                ['Medium', ''],
                ['Hard', ''],
              ]"
              :hide-icon="true"
              :button-style="'px-2 py-1'"
            />
          </div>
          <div class="flex flex-col items-center">
            <h3 class="text-lg">Effort</h3>
            <div class="flex gap-2">
              <FormsChoiceSlider
                class="mt-1"
                v-model="recipe.effort"
                :choices="[
                  ['Light', ''],
                  ['Moderate', ''],
                  ['Heavy', ''],
                ]"
                :hide-icon="true"
                :button-style="'py-1 px-2'"
              />
            </div>
          </div>
        </div>
        <div class="flex flex-col items-center mt-6 select-none">
          <h3 class="text-lg">Visibility</h3>
          <div class="flex gap-4">
            <FormsChoiceSlider
              class="mt-1"
              v-model="recipe.visibility"
              :choices="[
                ['Private', ''],
                ['Unlisted', ''],
                ['Public', ''],
              ]"
              :hide-icon="true"
              :button-style="'py-1 px-2'"
            />
          </div>
        </div>
        <button
          class="bg-white border-2 p-1 w-20 !text-lg shadow-[3px_3px_0_0_rgba(0,0,0,1)] mt-6 mb-1 select-none"
          @click="next"
        >
          Submit
        </button>
      </div>
      <div class="flex flex-col items-center gap-4" v-if="step === 4">
        <!-- Step 4: Upload an Image -->
        <h2 class="text-xl font-bold">Upload an Image</h2>
        <input ref="imgUpload" type="file" />
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined"> info </span>
          <span class="font-light"
            >If no image is provided, your recipe will not appear in
            searches.</span
          >
        </div>
        <button
          class="bg-white border-2 p-1 !text-lg shadow-[3px_3px_0_0_rgba(0,0,0,1)] mt-17 w-40"
          @click="submit"
        >
          Submit Recipe
        </button>
      </div>
    </div>
    <div
      class="relative flex w-full sm:px-30 px-10 -mt-11 justify-between"
      v-if="step != 5"
    >
      <button
        class="bg-white w-12 h-12 border-[3px] p-2 !text-2xl shadow-[3px_3px_0_0_rgba(0,0,0,1)] flex items-center justify-center select-none"
        @click="back"
        :disabled="step === 1"
        :class="{ invisible: step == 1 }"
      >
        <span class="ml-2 material-symbols-outlined">arrow_back_ios</span>
      </button>

      <button
        class="bg-white w-12 h-12 border-3 p-2 !text-2xl shadow-[3px_3px_0_0_rgba(0,0,0,1)] select-none"
        @click="next"
        :disabled="step === 5"
        :class="{ invisible: step == 4 }"
      >
        <span class="material-symbols-outlined"> arrow_forward_ios </span>
      </button>
    </div>
  </div>
</template>

<script setup>
const step = ref(1);

const ingredientLookup = ref(false);
const ingredientQuery = ref('');
const foodSearchResults = ref([]);

const recipeSearchResults = ref([]);
const supabase = useSupabase();

const imgUpload = ref();

const recipe = ref({
  title: '',
  effort: 'Light',
  difficulty: 'Easy',
  visibility: 'Public',
  instructions: [],
  ingredients: [],
  tags: [],
  forked_from: null,
});

async function searchFoods(query) {
  if (!query) return;
  if (query.length <= 3) return;
  const { data, error } = await supabase.rpc('search_foods', {
    search_text: query,
  });
  if (error) {
    console.error(error);
  } else {
    foodSearchResults.value = data;
  }
}

async function searchRecipes(query) {
  if (!query) return;
  if (query.length <= 3) return;
  const { data, error } = await supabase.rpc('search_recipes', {
    search_text: query,
  });
  if (error) {
    console.error(error);
  } else {
    recipeSearchResults.value = data;
  }
}

const debouncedSearchFoods = debounce(searchFoods, 1000);
const debouncedSearchRecipes = debounce(searchRecipes, 1000);

watch(ingredientQuery, (newQuery) => {
  debouncedSearchFoods(newQuery.trim());
});

watch(
  () => recipe.value.title,
  (newTitle, oldTitle) => {
    //debouncedSearchRecipes(newTitle.trim());
    console.log(newTitle);
    if (newTitle == 'blue') {
      recipeSearchResults.value = [
        'Blueberry Cobbler',
        'Blueberry Jam',
        'Blue Waffles',
      ];
    } else {
      recipeSearchResults.value = [];
    }
  }
);

function addInstruction() {
  recipe.value.instructions.push('');
}

function removeInstruction(index) {
  recipe.value.instructions.splice(index, 1);
}

function next() {
  if (step.value < 5) step.value++;
}

function back() {
  if (step.value > 1) step.value--;
}

async function submit() {
  recipe.value.ingredients = recipe.value.ingredients.map((i) => ({
    ...i,
    amount: Number(i.amount) || 0,
  }));
  const {
    kcal,
    protein,
    carbohydrates,
    sugar,
    fat,
    saturated_fat,
    fiber,
    salt,
    price,
  } = calculateTotalNutrients(recipe.value.ingredients);

  Object.assign(recipe.value, {
    kcal,
    protein,
    carbohydrates,
    sugar,
    fat,
    saturated_fat,
    fiber,
    salt,
    price,
  });

  const allVegan = recipe.value.ingredients.every((i) => i.vegan);
  const allVeg = recipe.value.ingredients.every((i) => i.vegetarian);
  const allGF = recipe.value.ingredients.every((i) => i.gluten_free);
  if (allVegan) recipe.value.tags.push(62);
  if (allVeg) recipe.value.tags.push(63);
  if (allGF) recipe.value.tags.push(68);

  recipe.value.mnidx = 50;
  recipe.value.hidx = 50;
  let fileExt = null;
  if (imgUpload.value.files && imgUpload.value.files[0]) {
    const file = imgUpload.value.files[0];
    fileExt = file.name.split('.').pop();
  }

  const { data: recipeData, error: recipeError } = await supabase
    .from('recipes')
    .insert({
      title: recipe.value.title,
      effort: recipe.value.effort.toUpperCase(),
      difficulty: recipe.value.difficulty.toUpperCase(),
      visibility: recipe.value.visibility.toUpperCase(),
      instructions: recipe.value.instructions,
      created_by: 0,
      rating: 4.1,
      kcal,
      protein,
      carbohydrates,
      sugar,
      fat,
      saturated_fat,
      fiber,
      salt,
      price,
      mnidx: recipe.value.mnidx,
      hidx: recipe.value.hidx,
      picture_ext: fileExt,
      forked_from: recipe.value.forked_from,
    })
    .select('id');
  if (recipeError) throw recipeError;

  const recipeId = recipeData[0].id;

  if (recipe.value.tags.length) {
    const tagRows = recipe.value.tags.map((tagId) => ({
      recipe_id: recipeId,
      tag_id: tagId,
    }));
    await supabase.from('recipe_tags').insert(tagRows);
  }

  const foodRows = recipe.value.ingredients.map((item) => ({
    recipe_id: recipeId,
    food_id: item.id,
    amount: item.amount,
    unit: item.unit.toUpperCase(),
  }));
  await supabase.from('recipe_foods').insert(foodRows);

  if (recipe.value.has_picture) {
    await handleUpload(recipeId);
  }

  return recipeId;
}

function autoResize(event) {
  const textarea = event.target;
  textarea.style.height = 'auto'; // Reset height
  if (textarea.scrollHeight > 40) {
    textarea.style.height = textarea.scrollHeight + 'px'; // Set to scroll height
  } else {
    textarea.style.height = 40 + 'px';
  }
}

function addIngredient(ingredient) {
  ingredient.amount = '';
  ingredient.possibleUnits = getPossibleUnits(ingredient.measurements);
  ingredient.unit = ingredient.possibleUnits[0];
  recipe.value.ingredients.push(ingredient);
  ingredientLookup.value = false;
}

function removeIngredient(id) {
  recipe.value.ingredients = recipe.value.ingredients.filter(
    (ingredient) => ingredient.id != id
  );
}

const handleUpload = async (id) => {
  const file = imgUpload.value.files[0];
  if (!file) return;

  const fileExt = file.name.split('.').pop();
  const fileName = `${id}.${fileExt}`;

  const { error } = await supabase.storage
    .from('recipe')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Upload error:', error.message);
  } else {
    console.log('Upload successful:', filePath);
  }
};
</script>

<style scoped>
@media (min-width: 640px) {
  .papyrus-gradient {
    background: radial-gradient(
      ellipse at center,
      #f0ece41a 0%,
      #f5efe11a 80%,
      #ece4ce1a 100%
    );
  }
}

.hide-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
