<template>
  <div class="p-2 md:p-6 h-full flex flex-col flex-[1_1_23rem] items-start">
    <div class="px-4 py-1 mb-2 bg-primary text-white rounded-lg flex">
      <h2 class="text-lg font-bold">INGREDIENTS</h2>
    </div>
    <p class="text-sm text-gray-600 ml-1 font-light">Servings:</p>
    <FormsSlidingSelector
      v-model="modelValue.servingSize"
      :choices="[0.5, 1, 2, 3, 4, 5, 6, 7, 8]"
      :expanded="false"
      class="max-w-[150px]"
    />

    <!-- Ingredients List -->
    <div class="flex flex-col rounded-lg px-2 z-15">
      <div class="space-y-3 mt-4">
        <div
          v-for="category in props.modelValue.ingredients"
          :key="category.categoryName"
          class="flex flex-col gap-2 relative min-h-12"
        >
          <div
            class="flex justify-between items-center mb-3"
            v-if="category.categoryName !== 'uncategorized'"
          >
            <h3 class="py-2 font-semibold flex items-center gap-2">
              <span class="material-symbols-outlined"> topic </span>
              {{ category.categoryName }}
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
              v-for="(ingredient, index) in category.ingredients"
              :key="`input-${index}`"
              class="ingredient-input-container"
            >
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-2">
                  <input
                    v-if="ingredient.isEditing"
                    :ref="(el) => setInputRef(el, category.categoryName, index)"
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
              modelValue.ingredients.push({
                categoryName: newCategoryName,
                ingredients: [createEmptyIngredient()],
                searchQuery: '',
                searchResults: [],
              });
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

<script setup>
const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
});
const emit = defineEmits(['update:modelValue']);

const supabase = useSupabaseClient();
const addingCategory = ref(false);
const newCategoryName = ref('');
const inputRefs = ref({});

// Initialize ingredients structure
onMounted(() => {
  ensureIngredientsStructure();
});

function ensureIngredientsStructure() {
  props.modelValue.ingredients.forEach((category) => {
    if (!category.ingredients) {
      category.ingredients = [];
    }

    // Ensure existing ingredients have the isEditing property
    category.ingredients.forEach((ingredient) => {
      if (ingredient.isEditing === undefined) {
        // Existing ingredients start in view mode if they have content, edit mode if empty
        ingredient.isEditing =
          !ingredient.rawText || ingredient.rawText.trim() === '';
      }
    });

    // Ensure exactly one empty ingredient per category
    ensureOneEmptyIngredient(category);
  });
}

function createEmptyIngredient() {
  return {
    rawText: '',
    amount: null,
    unit: null,
    food: null,
    preparation_description: null,
    parsed: [],
    isEditing: true, // New ingredients start in edit mode
  };
}

function setInputRef(el, categoryName, index) {
  if (el) {
    const key = `${categoryName}-${index}`;
    inputRefs.value[key] = el;
  }
}

async function handleInput(category, index) {
  const ingredient = category.ingredients[index];

  // Check if text ends with space for live preview (mobile-friendly)
  if (ingredient.rawText.endsWith(' ') && ingredient.rawText.trim()) {
    await parseIngredient(category, index);
  }

  if (!ingredient.rawText.trim()) {
    ingredient.parsed = [];
    ingredient.amount = null;
    ingredient.unit = null;
    ingredient.preparation_description = null;
  }

  // Ensure exactly one empty ingredient exists
  ensureOneEmptyIngredient(category);
}

async function handleBlur(category, index) {
  const ingredient = category.ingredients[index];

  if (ingredient.rawText.trim()) {
    await parseIngredient(category, index);
    ingredient.isEditing = false;
  }

  ensureOneEmptyIngredient(category);
}

async function handleEnter(category, index) {
  const ingredient = category.ingredients[index];

  if (ingredient.rawText.trim()) {  
    await parseIngredient(category, index);
    ingredient.isEditing = false;
  }

  // Focus next input or create new one
  const nextIndex = index + 1;
  if (nextIndex < category.ingredients.length) {
    await nextTick();
    startEditing(category, nextIndex);
  }
}

async function startEditing(category, index) {
  const ingredient = category.ingredients[index];
  ingredient.isEditing = true;

  await nextTick();
  const key = `${category.categoryName}-${index}`;
  const input = inputRefs.value[key];
  if (input) {
    input.focus();
  }
}

async function parseIngredient(category, index) {
  const ingredient = category.ingredients[index];

  if (!ingredient.rawText.trim()) {
    ingredient.parsed = [];
    return;
  }

  try {
    const result = await parseIngredientString(supabase, ingredient.rawText);

    ingredient.amount = result.amount;
    ingredient.unit = result.unit;
    Object.assign(ingredient, result.ingredient);
    ingredient.preparation_description = result.preparation_description;
    ingredient.parsed = result.parsed;
  } catch (error) {
    console.error('Error parsing ingredient:', error);
    ingredient.parsed = [
      { text: ingredient.rawText, styling: 'text-gray-600' },
    ];
  }
}

function removeIngredient(category, index) {
  category.ingredients.splice(index, 1);
  ensureOneEmptyIngredient(category);
}

function isLastEmptyIngredient(category, index) {
  const ingredient = category.ingredients[index];
  const emptyIngredients = category.ingredients.filter(
    (ing) => !ing.rawText || ing.rawText.trim() === ''
  );

  return (
    emptyIngredients.length === 1 &&
    (!ingredient.rawText || ingredient.rawText.trim() === '')
  );
}

function ensureOneEmptyIngredient(category) {
  const emptyIngredients = category.ingredients.filter(
    (ing) => !ing.rawText || ing.rawText.trim() === ''
  );

  if (emptyIngredients.length === 0) {
    category.ingredients.push(createEmptyIngredient());
  } else if (emptyIngredients.length > 1) {
    let removedCount = 0;
    for (
      let i = category.ingredients.length - 1;
      i >= 0 && removedCount < emptyIngredients.length - 1;
      i--
    ) {
      const ingredient = category.ingredients[i];
      if (!ingredient.rawText || ingredient.rawText.trim() === '') {
        category.ingredients.splice(i, 1);
        removedCount++;
      }
    }
  }
}

function removeCategory(category) {
  const uncategorized = props.modelValue.ingredients.find(
    (cat) => cat.categoryName === 'uncategorized'
  );
  if (uncategorized) {
    if (category.finalizedIngredients) {
      if (!uncategorized.finalizedIngredients) {
        uncategorized.finalizedIngredients = [];
      }
      uncategorized.finalizedIngredients.push(...category.finalizedIngredients);
    }
  }
  const idx = props.modelValue.ingredients.findIndex(
    (cat) => cat.categoryName === category.categoryName
  );
  if (idx !== -1) {
    props.modelValue.ingredients.splice(idx, 1);
  }
}
</script>

<style scoped>
</style>
