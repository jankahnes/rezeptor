<template>
  <div class="flex justify-center w-full">
    <div class="w-full flex flex-col gap-4 items-start">
      <textarea
        v-model="baseRecipe.title"
        v-auto-resize
        rows="1"
        placeholder="✍️ New Recipe"
        class="min-w-[40%] font-bold text-3xl border-box bg-primary-20/70! rounded-2xl p-2 outline-none resize-none overflow-hidden h-auto break-words scrollbar-hide"
      />

      <textarea
        v-model="baseRecipe.description"
        v-auto-resize
        rows="1"
        placeholder="✍️ Description"
        class="min-w-[60%] bg-primary-20/70! rounded-2xl p-2 outline-none resize-none overflow-hidden h-auto break-words scrollbar-hide text-sm"
      ></textarea>
      <div class="flex w-full flex-wrap gap-4 mt-8">
        <PagesRecipeIngredientListEditable
          v-model="ingredientListEditableInformation"
          class="bg-primary-20/70! flex-1"
        ></PagesRecipeIngredientListEditable>

        <PagesRecipeInstructionContainerEditable
          v-model="instructionsEditableInformation.instructions"
          class="bg-primary-20/70! flex-1"
        ></PagesRecipeInstructionContainerEditable>
      </div>
      <div class="flex w-full flex-wrap gap-4">
        <NutritionLabel
          v-if="computedRecipe?.hidx !== undefined"
          :nutritionData="computedRecipe"
          class="bg-primary-20/70!"
        />

        <HealthFacts
          v-if="computedRecipe?.hidx !== undefined"
          :recipe="computedRecipe"
          :on-report="onClickReport"
          class="bg-primary-20/70!"
        />
      </div>
      <div class="flex gap-2 w-full justify-start mt-6">
        <button
          class="flex gap-2 items-center justify-center bg-primary text-white border-3 border-primary rounded-xl px-2 py-1 font-bold shadow-lg"
          @click="submit()"
        >
          Submit
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import convertUploadableToComputable from '~~/server/utils/convertUploadableToComputable';

const props = defineProps<{
  submitFromPreparsed: (recipe: ComputableRecipe) => void;
  submitFromNaturalLanguage: (recipe: BaseRecipe) => void;
}>();

const originalRecipeId = ref<number | null>(null);
const originalUserId = ref<string | null>(null);
const isEditing = ref(false);
const supabase = useSupabaseClient();

const route = useRoute();
const recipeStore = useRecipeStore();
const computedRecipe = ref<InsertableRecipe | null>(null);

const ingredientListEditableInformation = ref<{
  serves: number;
  fullIngredients: EditableIngredient[];
  useNaturalLanguage: boolean;
  base_ingredients: string;
}>({
  serves: 1,
  fullIngredients: [],
  useNaturalLanguage: false,
  base_ingredients: '',
});

const instructionsEditableInformation = ref<{
  instructions: string[];
}>({
  instructions: [],
});

const baseRecipe = ref({
  title: '',
  description: '',
  user_id: null,
  source: null,
});

// Convert EditableIngredient to FullIngredient by filtering out incomplete ingredients
function convertToFullIngredients(
  editableIngredients: EditableIngredient[]
): FullIngredient[] {
  return editableIngredients
    .filter((ing) => ing.id && ing.name && ing.rawText.trim() !== '')
    .map((ing) => {
      const { isEditing, parsed, rawText, ...rest } = ing;
      return { ...rest, ...rest.food, id: rest.id } as FullIngredient;
    });
}

const parsingRecipe = computed<ComputableRecipe>(() => {
  const fullIngredients = convertToFullIngredients(
    ingredientListEditableInformation.value.fullIngredients
  );
  return {
    ...baseRecipe.value,
    serves: ingredientListEditableInformation.value.serves,
    source_type: 'PREPARSED',
    fullIngredients,
    instructions: instructionsEditableInformation.value.instructions,
  } as ComputableRecipe;
});

const naturalLanguageBaseRecipe = computed<BaseRecipe>(() => ({
  ...baseRecipe.value,
  base_ingredients: ingredientListEditableInformation.value.base_ingredients
    .split('\n')
    .map((ingredient: string) => ingredient.trim()),
  serves: ingredientListEditableInformation.value.serves,
  instructions: instructionsEditableInformation.value.instructions,
  source_type: 'TEXT',
}));

function submit() {
  if (ingredientListEditableInformation.value.useNaturalLanguage) {
    props.submitFromNaturalLanguage(naturalLanguageBaseRecipe.value);
  } else {
    props.submitFromPreparsed(parsingRecipe.value);
  }
}

function onClickReport() {
  recipeStore.setEditingRecipe(parsingRecipe.value);
  navigateTo(`/recipe/new/report`);
}

// Convert FullIngredient to EditableIngredient for editing
function convertToEditableIngredients(
  fullIngredients: FullIngredient[],
  serves: number
): EditableIngredient[] {
  return fullIngredients.map((ing) => ({
    ...ing,
    amount: ing.amount * serves,
    category: ing.category || 'uncategorized',
    rawText: ing.rawText || '',
    parsed: ing.parsed || [],
    isEditing: false,
  }));
}

function setEditableInformation(computableRecipe: ComputableRecipe | null) {
  if (!computableRecipe) return;
  ingredientListEditableInformation.value = {
    serves: computableRecipe.batch_size ?? 1,
    fullIngredients: convertToEditableIngredients(
      computableRecipe.fullIngredients,
      computableRecipe.batch_size ?? 1
    ),
    useNaturalLanguage: false,
    base_ingredients: getStringFromIngredients(
      computableRecipe.fullIngredients,
      computableRecipe.batch_size ?? 1
    ),
  };
  instructionsEditableInformation.value.instructions =
    removeInstructionFormatting(computableRecipe.instructions);
  Object.assign(baseRecipe.value, computableRecipe);
}

onMounted(async () => {
  isEditing.value = route.query.editCurrent === 'true';
  if (isEditing.value && recipeStore.recipe) {
    const originalRecipe = recipeStore.recipe;
    originalRecipeId.value = originalRecipe.id;
    originalUserId.value = originalRecipe.user_id;
    const computableRecipe = await convertUploadableToComputable(
      recipeStore.recipe,
      supabase,
      true
    );
    setEditableInformation(computableRecipe);
  } else if (recipeStore.isEditingNew) {
    setEditableInformation(recipeStore?.editingRecipe);
  } else {
    isEditing.value = false;
  }
  compute();
  watch(parsingRecipe, computeDebounced, { deep: true });
});

async function compute() {
  const response = (await $fetch('/api/calculate/recipe', {
    method: 'POST',
    body: {
      nutritionEngineArgs: {
        recipe: parsingRecipe.value,
        useGpt: false,
        logToReport: false,
        considerProcessing: false,
      },
    },
  })) as { recipeRow: InsertableRecipe };
  computedRecipe.value = response.recipeRow;
}

const computeDebounced = debounce(compute, 3000);
</script>
