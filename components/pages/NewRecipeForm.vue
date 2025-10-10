<template>
  <div class="flex justify-center w-full">
    <div class="pt-18 space-y-4 w-full max-w-screen-md">
      <textarea
        v-model="baseRecipe.title"
        v-auto-resize
        rows="1"
        placeholder="New Recipe"
        class="md:ml-4 w-full font-bold text-3xl border-box bg-transparent rounded-xl p-2 outline-none resize-none overflow-hidden h-auto break-words scrollbar-hide flex-1"
      />

      <textarea
        v-model="baseRecipe.description"
        v-auto-resize
        rows="1"
        placeholder="Description"
        class="md:ml-4 w-full bg-transparent rounded-xl p-2 outline-none resize-none overflow-hidden h-auto break-words scrollbar-hide flex-1 text-sm"
      ></textarea>
      <div class="flex mt-6 w-full flex-wrap">
        <PagesRecipeIngredientListEditable
          v-model="ingredientListEditableInformation"
        ></PagesRecipeIngredientListEditable>

        <PagesRecipeInstructionContainerEditable
          v-model="instructionsEditableInformation.instructions"
          class=""
        ></PagesRecipeInstructionContainerEditable>

        <NutritionLabel
          v-if="computedRecipe?.hidx"
          :recipe="computedRecipe"
          class=""
        />

        <HealthFacts
          v-if="computedRecipe?.hidx"
          :recipe="computedRecipe"
          :on-report="onClickReport"
          class=""
        />
      </div>
      <div class="flex gap-2 w-full justify-end mt-6">
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
import type { EditableIngredient } from '~/types/types';
import getStringFromIngredients from '~/utils/format/getStringFromIngredients';

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
  ingredients_string: string;
}>({
  serves: 1,
  fullIngredients: [],
  useNaturalLanguage: false,
  ingredients_string: '',
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
  uploading_protocol: 'fast' as const,
  publish: false,
});

// Convert EditableIngredient to FullIngredient by filtering out incomplete ingredients
function convertToFullIngredients(
  editableIngredients: EditableIngredient[]
): FullIngredient[] {
  return editableIngredients
    .filter((ing) => ing.id && ing.name && ing.rawText.trim() !== '')
    .map((ing) => {
      const { isEditing, parsed, rawText, ...rest } = ing;
      return {...rest.food, ...rest} as FullIngredient;
    });
}

const parsingRecipe = computed<ComputableRecipe>(() => {
  const fullIngredients = convertToFullIngredients(
    ingredientListEditableInformation.value.fullIngredients
  );
  return {
    serves: ingredientListEditableInformation.value.serves,
    source_type: 'PREPARSED',
    fullIngredients,
    instructions: instructionsEditableInformation.value.instructions,
    ...baseRecipe.value,
  } as ComputableRecipe;
});

const naturalLanguageBaseRecipe = computed<BaseRecipe>(() => ({
  ingredients_string:
    ingredientListEditableInformation.value.ingredients_string,
  serves: ingredientListEditableInformation.value.serves,
  instructions: instructionsEditableInformation.value.instructions,
  source_type: 'TEXT',
  ...baseRecipe.value,
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
  fullIngredients: FullIngredient[]
): EditableIngredient[] {
  return fullIngredients.map((ing) => ({
    ...ing,
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
      computableRecipe.fullIngredients
    ),
    useNaturalLanguage: false,
    ingredients_string: getStringFromIngredients(
      computableRecipe.fullIngredients,
      computableRecipe.batch_size ?? 1
    ),
  };
  instructionsEditableInformation.value.instructions =
    computableRecipe.instructions;
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
});

async function compute() {
  console.log(parsingRecipe.value);
  const response = (await $fetch('/api/calculate/recipe', {
    method: 'POST',
    body: {
      calculatorArgs: {
        recipe: parsingRecipe.value,
        useGpt: false,
        false: true,
        considerProcessing: false,
      },
    },
  })) as { recipeRow: InsertableRecipe };
  console.log(response.recipeRow);
  computedRecipe.value = response.recipeRow;
}

const computeDebounced = debounce(compute, 3000);

watch(parsingRecipe, computeDebounced, { deep: true });
</script>
