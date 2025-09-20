<template>
  <div class="flex justify-center w-full">
    <div class="pt-18 space-y-4 w-full max-w-screen-lg">
      <textarea
        v-model="recipe.title"
        v-auto-resize
        rows="1"
        placeholder="New Recipe"
        class="md:ml-4 w-full font-bold text-3xl border-box bg-transparent rounded-xl p-2 outline-none resize-none overflow-hidden h-auto break-words scrollbar-hide flex-1"
      />

      <textarea
        v-model="recipe.description"
        v-auto-resize
        rows="1"
        placeholder="Description"
        class="md:ml-4 w-full bg-transparent rounded-xl p-2 outline-none resize-none overflow-hidden h-auto break-words scrollbar-hide flex-1 text-sm"
      ></textarea>
      <div class="flex mt-6 w-full flex-wrap">
        <PagesRecipeIngredientListEditable
          v-model="recipe.ingredients_editable"
          class=""
        ></PagesRecipeIngredientListEditable>

        <PagesRecipeInstructionContainerEditable
          v-model="recipe.instructions"
          class=""
        ></PagesRecipeInstructionContainerEditable>

        <NutritionLabel v-if="displayInfo" :recipe="recipeComputed" class="" />

        <HealthFacts
          v-if="displayInfo"
          :recipe="recipeComputed"
          :on-report="onClickReport"
          class=""
        />
      </div>
      <div
        class="fixed right-15 bottom-22 xm:bottom-6 xm:right-6 z-100 flex gap-2 w-full xm:w-auto justify-end"
      >
        <button
          class="flex gap-2 items-center justify-center bg-main border-3 border-primary text-primary rounded-xl p-2 font-bold shadow-lg"
          @click="submit(recipe)"
        >
          Submit
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  submit: (recipe: RecipeProcessed) => void;
}>();

const originalRecipeId = ref(null);
const originalUserId = ref(null);
const isEditing = ref(false);

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
            rawText: '',
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
              rawText: '',
              parsed: [],
            },
          ],
          searchQuery: '',
          searchResults: [],
        },
      ];
    }
  } else if (recipeStore.isEditingNew) {
    recipe.value = recipeStore.recipe;
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
</script>
