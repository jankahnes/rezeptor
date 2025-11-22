<template>
  <div class="max-w-screen-lg space-y-6 m-4 p-4 xl:ml-30 pb-20">
    <h1 class="text-3xl font-bold">Your Daily Tracking</h1>

    <!-- Fixed save button -->
    <div
      class="fixed bottom-16 left-1/2 translate-x-[-50%] sm:translate-x-0 sm:bottom-4 sm:left-4 z-50"
    >
      <button
        @click="saveMeals"
        :disabled="isSaving || !hasUnsavedChanges"
        class="button flex items-center gap-2 px-4 py-2 shadow-lg transition-all"
        :class="{
          'bg-primary-100! text-gray-800': hasUnsavedChanges,
          'bg-gray-200! text-gray-500': !hasUnsavedChanges,
          'opacity-50 cursor-not-allowed': isSaving,
        }"
      >
        <span v-if="isSaving" class="material-symbols-outlined animate-spin">
          progress_activity
        </span>
        <span v-else-if="hasUnsavedChanges" class="material-symbols-outlined">
          save
        </span>
        <span v-else class="material-symbols-outlined"> check </span>

        <span class="text-sm font-medium">
          {{ isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save' : 'Saved' }}
        </span>

        <span
          v-if="lastSavedAt && !hasUnsavedChanges"
          class="text-xs opacity-70"
        >
          {{ formatTimeAgo(lastSavedAt) }}
        </span>
      </button>
    </div>

    <!-- Meal adding buttons -->
    <div class="flex flex-wrap gap-4 select-none">
      <button
        class="button flex items-center gap-2 px-4 py-1 bg-primary-10!"
        @click="showRecipeSearchModal = true"
      >
        <span class="material-symbols-outlined">add</span>
        Add Meal from Recipe
      </button>
      <button
        v-for="mealPreset in mealPresets"
        :key="mealPreset"
        class="button flex items-center gap-2 px-4 py-1"
        @click="addMeal(mealPreset)"
      >
        {{ mealPreset }}
      </button>
      <button
        v-if="!showCustomMealInput"
        class="button flex items-center gap-2 px-4 py-1"
        @click="showCustomMealInput = true"
      >
        <span class="material-symbols-outlined">add</span>
        Add Other Meal
      </button>
      <div v-else class="flex items-center gap-2 button px-2 py-1">
        <input
          v-model="customMealName"
          placeholder="Enter meal name"
          class="focus:outline-none"
        />
        <button
          class="material-symbols-outlined"
          @click="addMeal(customMealName)"
        >
          check
        </button>
      </div>
    </div>

    <!-- Meals list -->
    <div class="flex flex-col gap-2">
      <div
        v-for="(meal, index) in trackedMeals"
        class="flex flex-col gap-2 p-4 shadow-none! bg-primary-10/70 rounded-xl"
        :class="{ 'bg-primary-100/70!': meal.recipe_id !== undefined }"
      >
        <div
          class="flex items-center gap-2 button bg-transparent! outline-none! shadow-none! justify-between"
          @click="meal.collapsed = !meal.collapsed"
        >
          <div class="relative inline-block">
            <span
              class="text-lg font-bold py-2 px-3 invisible whitespace-pre"
              aria-hidden="true"
              >{{ trackedMeals[index].mealName || '✍️ Meal name' }}</span
            >
            <input
              :class="{ 'bg-primary-50/80!': meal.recipe_id !== undefined }"
              v-model="trackedMeals[index].mealName"
              class="text-lg font-bold focus:outline-none bg-primary-50 rounded-md py-2 px-3 absolute inset-0 w-full"
              @click.stop
              placeholder="✍️ Meal name"
            />
          </div>
          <div class="flex items-center gap-2 text-gray-600">
            <NuxtLink
              :to="`/recipe/${meal.recipe_id}`"
              class="flex items-center justify-center rounded-md px-2 py-1 gap-1"
              v-if="meal.recipe_id !== undefined"
              @click.stop
            >
              <span class="text-xs hidden sm:block">Jump to recipe</span>
              <span class="material-symbols-outlined text-base!">
                open_in_new
              </span>
            </NuxtLink>
            <div class="material-symbols-outlined rounded-md p-1">
              {{ meal.collapsed ? 'expand_more' : 'expand_less' }}
            </div>
            <button
              class="material-symbols-outlined rounded-md p-1"
              @click="removeMeal(index)"
            >
              delete
            </button>
          </div>
        </div>
        <div v-if="!meal.collapsed" class="min-h-12 flex flex-col gap-2">
          <div
            v-for="(ingredient, ingredientIndex) in meal.editableIngredients"
            :key="`${index}-${ingredientIndex}`"
          >
            <TrackingInput
              :ref="(el) => setInputRef(index, ingredientIndex, el)"
              v-model="trackedMeals[index].editableIngredients[ingredientIndex]"
              @focus-next="focusNextInput(index, ingredientIndex)"
              @delete-ingredient="deleteIngredient(index, ingredientIndex)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Nutrition summary -->
    <div
      v-if="computedDailyNutrition?.hidx !== undefined"
      class="flex flex-wrap gap-4 mt-8"
    >
      <NutritionLabel :nutritionData="computedDailyNutrition" />
      <HealthFacts :recipe="computedDailyNutrition" />
    </div>

    <!-- Modal for adding a meal from a recipe-->
    <BlocksResponsiveModal v-model="showRecipeSearchModal">
      <template #default="{ isMobile }">
        <div
          class="flex flex-col gap-6 p-6 max-h-[50%] sm:min-w-120 mb-10 md:mb-0"
          @click.stop
        >
          <div class="flex flex-col gap-2">
            <h3 class="text-2xl font-bold">Add a meal from a recipe</h3>
            <input
              type="text"
              placeholder="Search..."
              class="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:border-gray-500"
              v-model="recipeSearchQuery"
            />
          </div>
          <div
            class="overflow-y-auto flex flex-col gap-2 scrollbar-hide"
            v-if="recipeSearchResults.length > 0"
          >
            <RecipeCardHorizontal
              v-for="recipe in recipeSearchResults"
              :recipe="recipe"
              class="w-full text-2xl"
              :key="`${isMobile ? 'mobile' : 'desktop'}-${recipe.id}`"
              :uniqueId="`${isMobile ? 'mobile' : 'desktop'}-${recipe.id}`"
              @click.stop.prevent.capture="addMealFromRecipe(recipe.id)"
            />
          </div>
        </div>
      </template>
    </BlocksResponsiveModal>
  </div>
</template>

<script setup lang="ts">
import convertUploadableToComputable from '~~/server/utils/convertUploadableToComputable';

type TrackedMeal = {
  id?: number; // DB id, undefined for new meals
  mealName: string;
  recipe_id?: number;
  editableIngredients: EditableTrackingItem[];
  fullIngredients: FullIngredient[] | null;
  collapsed: boolean;
  summaryNutritionData: {
    weight: number;
    kcal: number;
    protein: number;
    fat: number;
    carbohydrates: number;
  };
};

const supabase = useSupabaseClient<Database>();
const user = useSupabaseUser();

const computedDailyNutrition = ref<InsertableRecipe | null>(null);
const trackedMeals = ref<TrackedMeal[]>([]);

const showRecipeSearchModal = ref(false);
const showCustomMealInput = ref(false);

const customMealName = ref('');

// Save/load state
const selectedDate = ref(new Date());
const isSaving = ref(false);
const isLoading = ref(false);
const lastSavedAt = ref<Date | null>(null);
const hasUnsavedChanges = ref(false);

const recipeSearchQuery = ref('');
const recipeSearchResults = ref<RecipeOverview[]>([]);

// Refs for TrackingInput components: [mealIndex][ingredientIndex] -> component instance
const inputRefs = ref<Map<string, any>>(new Map());

const setInputRef = (mealIndex: number, ingredientIndex: number, el: any) => {
  if (el) {
    inputRefs.value.set(`${mealIndex}-${ingredientIndex}`, el);
  }
};

const focusNextInput = (
  currentMealIndex: number,
  currentIngredientIndex: number
) => {
  nextTick(() => {
    // Try next ingredient in same meal
    const nextIngredientIndex = currentIngredientIndex + 1;
    if (
      trackedMeals.value[currentMealIndex]?.editableIngredients[
        nextIngredientIndex
      ]
    ) {
      const ref = inputRefs.value.get(
        `${currentMealIndex}-${nextIngredientIndex}`
      );
      ref?.focus();
      return;
    }

    // Try first ingredient in next meal
    const nextMealIndex = currentMealIndex + 1;
    if (
      trackedMeals.value[nextMealIndex] &&
      !trackedMeals.value[nextMealIndex].collapsed &&
      trackedMeals.value[nextMealIndex].editableIngredients.length > 0
    ) {
      const ref = inputRefs.value.get(`${nextMealIndex}-0`);
      ref?.focus();
      return;
    }

    // If no next input, ensure there's an empty one and focus it
    if (trackedMeals.value[currentMealIndex]) {
      const meal = trackedMeals.value[currentMealIndex];
      const emptyInputs = meal.editableIngredients.filter(
        (ing) => !ing.rawText.trim()
      );
      if (emptyInputs.length === 0) {
        meal.editableIngredients.push({
          rawText: '',
          parsed: [],
        });
        nextTick(() => {
          const newIndex = meal.editableIngredients.length - 1;
          const ref = inputRefs.value.get(`${currentMealIndex}-${newIndex}`);
          ref?.focus();
        });
      }
    }
  });
};

const mealPresets = [
  'Breakfast 🥐',
  'Lunch 🍔',
  'Dinner 🍝',
  'Snack 🍟',
  'Dessert 🍰',
];

const addMeal = (mealName: string) => {
  trackedMeals.value.push({
    mealName,
    editableIngredients: [],
    fullIngredients: null,
    collapsed: false,
    summaryNutritionData: {
      weight: 0,
      kcal: 0,
      protein: 0,
      fat: 0,
      carbohydrates: 0,
    },
  });
};

const addMealFromRecipe = async (recipeId: number) => {
  showRecipeSearchModal.value = false;
  const recipe = await getRecipe(supabase, { eq: { id: recipeId } });
  const computableRecipe = await convertUploadableToComputable(
    recipe,
    supabase,
    true,
    1
  );
  const editableTrackingItems = computableRecipe.fullIngredients.map(
    (ingredient) => {
      const { amount, unit, parsed = [], rawText = '', ...rest } = ingredient;
      return {
        amount,
        unit,
        parsed,
        rawText,
        food: rest,
      };
    }
  );
  trackedMeals.value.push({
    mealName: recipe.title,
    recipe_id: recipeId,
    editableIngredients:
      editableTrackingItems as unknown as EditableTrackingItem[],
    fullIngredients: [],
    collapsed: true,
    summaryNutritionData: {
      weight: recipe.total_weight,
      kcal: recipe.kcal || 0,
      protein: recipe.protein || 0,
      fat: recipe.fat || 0,
      carbohydrates: recipe.carbohydrates || 0,
    },
  });
};

const deleteIngredient = (mealIndex: number, ingredientIndex: number) => {
  trackedMeals.value[mealIndex].editableIngredients.splice(ingredientIndex, 1);
};

const removeMeal = (index: number) => {
  trackedMeals.value.splice(index, 1);
};

const ensureOneEmptyInput = () => {
  for (const meal of trackedMeals.value) {
    //@ts-ignore
    const emptyInputs = meal.editableIngredients.filter(
      (ingredient) => ingredient.rawText.trim() === ''
    );
    if (emptyInputs.length === 0) {
      meal.editableIngredients.push({
        rawText: '',
        parsed: [],
      });
    }
  }
};

// Format date for DB queries (YYYY-MM-DD)
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Format time ago for UI
function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return 'today';
}

// Load meals from database
async function loadMeals(date: Date) {
  if (!user.value) return;

  try {
    isLoading.value = true;

    const { data: mealsData, error } = await supabase
      .from('tracked_meals')
      .select(
        `
        id,
        meal_name,
        collapsed,
        meal_order,
        tracked_meal_foods (
          id,
          food_name:food_names(*, food:foods(*)),
          branded_food:branded_foods(*, food_name:food_names(id, name, food:foods(*))),
          amount,
          unit,
          raw_text,
          food_order
        )
      `
      )
      .eq('user_id', user.value.id)
      .eq('meal_date', formatDate(date))
      .order('meal_order', { ascending: true });

    if (error) throw error;

    // Type assertion to avoid deep type instantiation
    const meals = mealsData as any[];

    if (meals && meals.length > 0) {
      // Transform DB data to TrackedMeal format
      const transformedMeals: TrackedMeal[] = [];

      for (const meal of meals) {
        const foods = meal.tracked_meal_foods || [];
        const sortedFoods = foods.sort(
          (a: any, b: any) => (a.food_order ?? 0) - (b.food_order ?? 0)
        );
        console.log(sortedFoods);
        const editableIngredients: EditableTrackingItem[] = sortedFoods.map(
          (food: any) => {
            let unitName = food.unit.toLowerCase();
            const processedBrandedFood = postprocessBrandedFood(
              food.branded_food ?? {}
            );
            if (isCountable(food.unit) && food.amount != 1 && food.unit) {
              unitName = pluralizeWord(unitName);
            }
            return {
              id:
                processedBrandedFood.food_name?.id ||
                food.food_name?.id ||
                undefined,
              rawText: food.raw_text || '',
              amount: food.amount || undefined,
              unit: food.unit || undefined,
              parsed: [
                {
                  text: food.amount.toString(),
                  type: 'amount',
                  styling: amountStyling,
                },
                {
                  text: unitName,
                  type: 'unit',
                  styling: unitStyling,
                },
                {
                  text: processedBrandedFood?.product_name
                    ? (processedBrandedFood?.brand ?? '') +
                      ' ' +
                      processedBrandedFood?.product_name
                    : food?.food_name?.name,
                  type: 'ingredient',
                  styling: ingredientStyling,
                },
              ],
              food:
                processedBrandedFood?.food_name?.food ||
                food?.food_name?.food ||
                undefined,
              brandedFood: processedBrandedFood || undefined,
            };
          }
        );

        transformedMeals.push({
          id: meal.id,
          mealName: meal.meal_name,
          collapsed: meal.collapsed ?? false,
          editableIngredients,
          fullIngredients: null,
          summaryNutritionData: {
            weight: 0,
            kcal: 0,
            protein: 0,
            fat: 0,
            carbohydrates: 0,
          },
        });
      }

      trackedMeals.value = transformedMeals;
    } else {
      // No meals for this date, start with empty "Other" meal
      trackedMeals.value = [];
      addMeal('Other');
    }

    hasUnsavedChanges.value = false;
  } catch (error) {
    console.error('Error loading meals:', error);
    alert('Failed to load meals. Please refresh the page.');
  } finally {
    await computeNutrition();
    isLoading.value = false;
  }
}

// Save meals to database
async function saveMeals() {
  if (!user.value || !hasUnsavedChanges.value) return;

  try {
    isSaving.value = true;

    // Delete all existing meals for this date
    const { error: deleteError } = await supabase
      .from('tracked_meals')
      .delete()
      .eq('user_id', user.value.id)
      .eq('meal_date', formatDate(selectedDate.value));

    if (deleteError) throw deleteError;

    // Re-insert all meals
    for (
      let mealIndex = 0;
      mealIndex < trackedMeals.value.length;
      mealIndex++
    ) {
      const meal = trackedMeals.value[mealIndex];

      // Skip meals with no valid ingredients
      const validIngredients = meal.editableIngredients.filter(
        (ing: any) => ing.rawText?.trim() && ing.food?.id
      );

      if (validIngredients.length === 0 && !meal.mealName.trim()) {
        continue; // Skip completely empty meals
      }

      // Insert meal
      const { data: insertedMeal, error: mealError } = await supabase
        .from('tracked_meals')
        .insert({
          user_id: user.value.id,
          meal_name: meal.mealName || 'Untitled Meal',
          meal_date: formatDate(selectedDate.value),
          collapsed: meal.collapsed,
          meal_order: mealIndex,
        })
        .select()
        .single();

      if (mealError) throw mealError;

      // Update local id
      meal.id = insertedMeal.id;

      // Insert foods for this meal
      if (validIngredients.length > 0) {
        const foodsToInsert = validIngredients.map(
          (ing: any, foodIndex: number) => ({
            tracked_meal_id: insertedMeal.id,
            food_id: ing.id || null,
            branded_food_barcode: ing.brandedFood?.barcode || null,
            amount: ing.amount,
            unit: ing.unit,
            raw_text: ing.rawText,
            food_order: foodIndex,
          })
        );

        const { error: foodsError } = await supabase
          .from('tracked_meal_foods')
          .insert(foodsToInsert);

        if (foodsError) throw foodsError;
      }
    }

    hasUnsavedChanges.value = false;
    lastSavedAt.value = new Date();
  } catch (error) {
    console.error('Error saving meals:', error);
    alert('Failed to save meals. Please try again.');
  } finally {
    isSaving.value = false;
  }
}

const computeNutrition = async () => {
  //ts-ignore
  const fullIngredients = trackedMeals.value
    .flatMap((meal) => meal.editableIngredients)
    .filter(
      (ingredient) =>
        ingredient && ingredient.food?.id !== undefined && ingredient.amount
    )
    .map((ingredient) => ({
      ...ingredient,
      ...ingredient.food,
      id: ingredient.food?.id,
    }));
  if (fullIngredients.length === 0) {
    computedDailyNutrition.value = null;
    return;
  }
  const sendingRecipe = {
    title: 'Daily Tracking',
    fullIngredients,
    serves: 1,
  } as ComputableRecipe;
  const nutrition = await $fetch('/api/calculate/recipe', {
    method: 'POST',
    body: {
      nutritionEngineArgs: {
        recipe: sendingRecipe,
        useGpt: false,
        logToReport: false,
        considerProcessing: false,
        disableSatiety: true,
      },
    },
  });
  computedDailyNutrition.value = nutrition.recipeRow;
};

const searchRecipes = async () => {
  const recipes = await getRecipeOverviews(supabase, {
    trigram_search: { query: recipeSearchQuery.value, column: 'title' },
    limit: 4,
  });
  recipeSearchResults.value = recipes;
};

const computeNutritionDebounced = debounce(computeNutrition, 1000);
const searchRecipesDebounced = debounce(searchRecipes, 1000);

// Track unsaved changes
watch(
  trackedMeals,
  () => {
    ensureOneEmptyInput();
    computeNutritionDebounced();
    hasUnsavedChanges.value = true;
  },
  { deep: true }
);

watch(recipeSearchQuery, () => {
  searchRecipesDebounced();
});

// Load meals on mount
onMounted(() => {
  loadMeals(selectedDate.value);
});
</script>
