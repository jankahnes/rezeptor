<template>
  <div class="p-2 md:p-6 h-full flex flex-col flex-[1_1_22rem] items-start">
    <div class="flex justify-between items-center w-full gap-2 mb-2">
      <div class="px-4 py-1 bg-primary text-white rounded-lg flex mb-2">
        <h2 class="text-lg font-bold ">INGREDIENTS</h2>
      </div>
      <button
        class="button flex items-center gap-1 px-2 py-1 font-medium !bg-primary/10 text-primary text-xs will-change-transform leading-none"
        @click="model.useNaturalLanguage = !model.useNaturalLanguage"
      >
        <span class="material-symbols-outlined !text-sm">autorenew</span>
        <span>{{
          model.useNaturalLanguage
            ? 'Use Precise Parsing'
            : 'Use Natural Language'
        }}</span>
      </button>
    </div>
    <p class="text-sm text-gray-600 ml-1 font-light mt-2">Servings:</p>
    <FormsSlidingSelector
      v-model="model.serves"
      :choices="[0.5, 1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 16, 18, 20]"
      :expanded="false"
      class="max-w-[150px]"
    />

    <textarea
      v-if="model.useNaturalLanguage"
      v-model="model.ingredients_string"
      v-auto-resize
      rows="4"
      placeholder="For the dough:
100g of flour
2 tablespoons of olive oil"
      class="md:ml-1 w-full bg-transparent rounded-xl p-2 border border-gray-300 focus:outline-none resize-none flex-1 text-sm mt-4"
    ></textarea>
    <!-- Ingredients List -->
    <div class="flex flex-col rounded-lg px-2 z-15" v-else>
      <div class="space-y-3 mt-4">
        <div
          v-for="[category, ingredients] in Object.entries(groupedIngredients)"
          :key="category"
          class="flex flex-col gap-2 relative min-h-12"
        >
          <div
            class="flex justify-between items-center mb-3"
            v-if="category !== 'uncategorized'"
          >
            <h3 class="py-2 font-semibold flex items-center gap-2">
              <span class="material-symbols-outlined"> topic </span>
              {{ category }}
            </h3>
            <button
              @click="removeCategory(category)"
              class="material-symbols-outlined !text-lg cursor-pointer text-red-500 hover:text-red-700"
            >
              close
            </button>
          </div>

          <div class="space-y-2">
            <div
              v-for="(ingredient, index) in ingredients"
              :key="`input-${index}`"
              class="ingredient-input-container"
            >
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-2">
                  <input
                    v-if="ingredient.isEditing"
                    :ref="(el: any) => setInputRef(el, category, index)"
                    v-model="ingredient.rawText"
                    @input="handleInput(category, index)"
                    @blur="handleBlur(category, index)"
                    @keydown.enter="handleEnter(category, index)"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 100g flour or 2 tbsp olive oil"
                  />

                  <div
                    v-else
                    @click="startEditing(category, index)"
                    class="flex-1 px-3 py-2 border border-transparent rounded-md cursor-text hover:border-gray-300 transition-colors min-h-[2.5rem] flex flex-wrap gap-1 items-center"
                    :class="
                      ingredient.parsed && ingredient.parsed.length > 0
                        ? ''
                        : 'text-gray-400 italic'
                    "
                  >
                    <template
                      v-if="ingredient.parsed && ingredient.parsed.length > 0"
                    >
                      <span
                        v-for="(part, partIndex) in ingredient.parsed"
                        :key="partIndex"
                        :class="part.styling"
                      >
                        {{ part.text }}
                      </span>
                    </template>
                    <span v-else>e.g. 100g flour or 2 tbsp olive oil</span>
                  </div>

                  <button
                    v-if="!isLastEmptyIngredient(category, index)"
                    @click="removeIngredient(category, index)"
                    class="material-symbols-outlined !text-xl cursor-pointer text-gray-500 hover:text-gray-700"
                  >
                    close
                  </button>
                </div>

                <!-- Live preview while editing -->
                <div
                  v-if="
                    ingredient.isEditing &&
                    ingredient.parsed &&
                    ingredient.parsed.length > 0
                  "
                  class="px-3 py-1 bg-gray-50 rounded-md text-sm flex flex-wrap gap-1 items-center border-l-2 border-blue-200"
                >
                  <span
                    v-for="(part, partIndex) in ingredient.parsed"
                    :key="partIndex"
                    :class="part.styling"
                  >
                    {{ part.text }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          v-if="addingCategory"
          class="flex items-center justify-between gap-2 w-full px-4 border-1 border-gray-300 border-dashed rounded-lg"
        >
          <input
            v-model="newCategoryName"
            class="w-full focus:outline-none"
            placeholder="For the sauce..."
          />
          <button
            @click="
              addingCategory = false;
              newCategoryName = '';
            "
          >
            <span class="material-symbols-outlined !text-lg">close</span>
          </button>
          <button
            @click="
              model.fullIngredients.push(
                createEmptyIngredient(newCategoryName)
              );
              addingCategory = false;
              newCategoryName = '';
            "
          >
            <span class="material-symbols-outlined !text-lg">check</span>
          </button>
        </div>
        <button
          class="flex items-center gap-2 opacity-70 cursor-pointer select-none"
          v-else
          @click="
            addingCategory = true;
            newCategoryName = '';
          "
        >
          <span class="material-symbols-outlined !text-lg">add</span>
          <span class="text-base">Add Category</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const model = defineModel<{
  serves: number;
  fullIngredients: EditableIngredient[];
  useNaturalLanguage: boolean;
  ingredients_string: string;
}>({ required: true });

const supabase = useSupabaseClient();
const addingCategory = ref(false);
const newCategoryName = ref('');
const inputRefs = ref<Record<string, HTMLInputElement>>({});

const groupedIngredients = computed(() => {
  return groupIngredients(model.value.fullIngredients);
});

// Helper function to find ingredient in flat array by category and local index
function findIngredientInFlatArray(
  categoryName: string,
  localIndex: number
): EditableIngredient | null {
  const ingredientsInCategory = model.value.fullIngredients.filter(
    (ing) => (ing.category || 'uncategorized') === categoryName
  );
  return ingredientsInCategory[localIndex] || null;
}

// Helper function to find the flat array index of an ingredient
function findFlatArrayIndex(categoryName: string, localIndex: number): number {
  const ingredientsInCategory = model.value.fullIngredients.filter(
    (ing) => (ing.category || 'uncategorized') === categoryName
  );
  const targetIngredient = ingredientsInCategory[localIndex];
  if (!targetIngredient) return -1;
  return model.value.fullIngredients.indexOf(targetIngredient);
}

// Initialize ingredients structure
onMounted(() => {
  ensureIngredientsStructure();
});

function ensureIngredientsStructure() {
  if (!groupedIngredients.value.length) {
    ensureOneEmptyIngredient('uncategorized');
    return;
  }
  for (const [categoryName, ingredients] of Object.entries(
    groupedIngredients.value
  )) {
    if (!ingredients || ingredients.length === 0) {
      model.value.fullIngredients.push(createEmptyIngredient(categoryName));
    }

    ingredients.forEach((ingredient) => {
      if (ingredient.isEditing === undefined) {
        // Existing ingredients start in view mode if they have content, edit mode if empty
        ingredient.isEditing =
          !ingredient.rawText || ingredient.rawText.trim() === '';
      }
    });

    ensureOneEmptyIngredient(categoryName);
  }
}

function createEmptyIngredient(
  categoryName: string = 'uncategorized'
): EditableIngredient {
  return {
    category: categoryName,
    rawText: '',
    amount: null,
    unit: null,
    preparation_description: null,
    parsed: [],
    isEditing: true, // New ingredients start in edit mode
  };
}

function setInputRef(
  el: HTMLInputElement | null,
  categoryName: string,
  index: number
) {
  if (el) {
    const key = `${categoryName}-${index}`;
    inputRefs.value[key] = el;
  }
}

async function handleInput(categoryName: string, localIndex: number) {
  const ingredient = findIngredientInFlatArray(categoryName, localIndex);
  if (!ingredient) return;

  // Check if text ends with space for live preview (mobile-friendly)
  if (ingredient.rawText.endsWith(' ') && ingredient.rawText.trim()) {
    await parseIngredient(categoryName, localIndex);
  }

  if (!ingredient.rawText.trim()) {
    ingredient.parsed = [];
    ingredient.amount = null;
    ingredient.unit = null;
    ingredient.preparation_description = null;
  }

  // Ensure exactly one empty ingredient exists
  ensureOneEmptyIngredient(categoryName);
}

async function handleBlur(categoryName: string, localIndex: number) {
  const ingredient = findIngredientInFlatArray(categoryName, localIndex);
  if (!ingredient) return;

  if (ingredient.rawText.trim()) {
    await parseIngredient(categoryName, localIndex);
    ingredient.isEditing = false;
  }

  ensureOneEmptyIngredient(categoryName);
}

async function handleEnter(categoryName: string, localIndex: number) {
  const ingredient = findIngredientInFlatArray(categoryName, localIndex);
  if (!ingredient) return;

  if (ingredient.rawText.trim()) {
    await parseIngredient(categoryName, localIndex);
    ingredient.isEditing = false;
  }

  // Focus next input or create new one
  const ingredientsInCategory = model.value.fullIngredients.filter(
    (ing) => (ing.category || 'uncategorized') === categoryName
  );
  const nextIndex = localIndex + 1;
  if (nextIndex < ingredientsInCategory.length) {
    await nextTick();
    startEditing(categoryName, nextIndex);
  }
}

async function startEditing(categoryName: string, localIndex: number) {
  const ingredient = findIngredientInFlatArray(categoryName, localIndex);
  if (!ingredient) return;

  ingredient.isEditing = true;

  await nextTick();
  const key = `${categoryName}-${localIndex}`;
  const input = inputRefs.value[key];
  if (input) {
    input.focus();
  }
}

async function parseIngredient(categoryName: string, localIndex: number) {
  const ingredient = findIngredientInFlatArray(categoryName, localIndex);
  if (!ingredient) return;

  if (!ingredient.rawText.trim()) {
    ingredient.parsed = [];
    return;
  }

  try {
    const result = await parseIngredientString(supabase, ingredient.rawText);

    ingredient.amount = result.amount;
    ingredient.unit = result.unit;
    if (result.ingredient) {
      ingredient.id = result.ingredient.id;
      ingredient.name = result.ingredient.name;
      ingredient.density = result.ingredient.density;
      ingredient.countable_units = result.ingredient.countable_units;
      // Copy over any other relevant properties from result.ingredient
      Object.assign(ingredient, result.ingredient);
    }
    ingredient.preparation_description = result.preparationDescription;
    ingredient.parsed = result.parsed;
  } catch (error) {
    console.error('Error parsing ingredient:', error);
    ingredient.parsed = [
      { text: ingredient.rawText, styling: 'text-gray-600' },
    ];
  }
}

function removeIngredient(categoryName: string, localIndex: number) {
  const flatIndex = findFlatArrayIndex(categoryName, localIndex);
  if (flatIndex !== -1) {
    model.value.fullIngredients.splice(flatIndex, 1);
  }
  ensureOneEmptyIngredient(categoryName);
}

function isLastEmptyIngredient(categoryName: string, localIndex: number) {
  const ingredient = findIngredientInFlatArray(categoryName, localIndex);
  if (!ingredient) return false;

  const ingredientsInCategory = model.value.fullIngredients.filter(
    (ing) => (ing.category || 'uncategorized') === categoryName
  );
  const emptyIngredients = ingredientsInCategory.filter(
    (ing) => !ing.rawText || ing.rawText.trim() === ''
  );

  return (
    emptyIngredients.length === 1 &&
    (!ingredient.rawText || ingredient.rawText.trim() === '')
  );
}

function ensureOneEmptyIngredient(categoryName: string) {
  const ingredientsInCategory = model.value.fullIngredients.filter(
    (ing) => (ing.category || 'uncategorized') === categoryName
  );
  const emptyIngredients = ingredientsInCategory.filter(
    (ing) => !ing.rawText || ing.rawText.trim() === ''
  );

  if (emptyIngredients.length === 0) {
    model.value.fullIngredients.push(createEmptyIngredient(categoryName));
  } else if (emptyIngredients.length > 1) {
    // Remove extra empty ingredients
    let removedCount = 0;
    for (
      let i = model.value.fullIngredients.length - 1;
      i >= 0 && removedCount < emptyIngredients.length - 1;
      i--
    ) {
      const ingredient = model.value.fullIngredients[i];
      if (
        (ingredient.category || 'uncategorized') === categoryName &&
        (!ingredient.rawText || ingredient.rawText.trim() === '')
      ) {
        model.value.fullIngredients.splice(i, 1);
        removedCount++;
      }
    }
  }
}

function removeCategory(categoryName: string) {
  // Set all ingredients in this category to 'uncategorized'
  model.value.fullIngredients.forEach((ingredient) => {
    if (ingredient.category === categoryName) {
      ingredient.category = 'uncategorized';
    }
  });
}
</script>
