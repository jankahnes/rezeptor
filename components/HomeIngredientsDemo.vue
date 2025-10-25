<template>
  <div class="flex gap-8 h-66 flex-wrap justify-center">
    <div class="flex flex-col gap-4 justify-between w-full items-center">
      <div class="text-center">
        <h3 class="text-lg font-semibold mb-2">What do you have at home?</h3>
        <p class="text-sm text-gray-600 mb-4">
          Enter 3 ingredients to find recipes that use all of them
        </p>
      </div>

      <div class="flex flex-col gap-3 w-full max-w-md">
        <input
          v-model="ingredient1"
          placeholder="e.g., chicken"
          class="w-full px-3 py-2 border border-dashed border-primary rounded-lg focus:outline-none focus:border-solid"
        />
        <input
          v-model="ingredient2"
          placeholder="e.g., rice"
          class="w-full px-3 py-2 border border-dashed border-primary rounded-lg focus:outline-none focus:border-solid"
        />
        <input
          v-model="ingredient3"
          placeholder="e.g., vegetables"
          class="w-full px-3 py-2 border border-dashed border-primary rounded-lg focus:outline-none focus:border-solid"
        />
      </div>

      <button
        class="button px-6 py-2 font-bold text-white !bg-primary rounded-lg flex items-center gap-2 disabled:opacity-50"
        @click="searchRecipes"
      >
        <span class="material-symbols-outlined !text-lg">search</span>
        Find Recipes
      </button>
    </div>

    <div
      v-if="loading"
      class="flex items-center justify-center w-full max-w-80"
    >
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"
        ></div>
        <p class="text-sm text-gray-600">Searching for recipes...</p>
      </div>
    </div>

    <div
      v-else-if="hasSearched && !loading"
      class="flex flex-col items-center w-full max-w-4xl"
    >
      <!-- Recipe results or no results message -->
      <div v-if="recipes.length > 0" class="w-full">
        <div class="text-center mb-4">
          <h4 class="text-lg font-semibold">
            Found {{ recipes.length }} recipe{{
              recipes.length === 1 ? '' : 's'
            }}
          </h4>
          <p class="text-sm text-gray-600">
            Recipes using {{ matchedFoods.map((food) => food.matched).join(', ') }}
          </p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <RecipeCard
            v-for="recipe in recipes"
            :key="recipe.id"
            :recipe="recipe"
            class="min-w-75 max-w-85 basis-75 min-h-110 text-[32px] flex-1"
          />
        </div>
      </div>

      <div v-else class="text-center">
        <span class="material-symbols-outlined !text-4xl text-gray-400 mb-2"
          >search_off</span
        >
        <p class="text-sm text-gray-600">
          No recipes found with all three ingredients
        </p>
        <p class="text-xs text-gray-500 mt-1">
          Try different ingredient names or check spelling
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SupabaseClient } from '@supabase/supabase-js';

const ingredient1 = ref('');
const ingredient2 = ref('');
const ingredient3 = ref('');
const recipes = ref([]);
const loading = ref(false);
const hasSearched = ref(false);
const matchedFoods = ref([]);
const unmatchedFoods = ref([]);
const supabase = useSupabaseClient();

const searchRecipes = async () => {
  loading.value = true;
  hasSearched.value = true;
  recipes.value = [];
  matchedFoods.value = [];
  unmatchedFoods.value = [];

  try {
    const foodNames = [
      ingredient1.value.trim(),
      ingredient2.value.trim(),
      ingredient3.value.trim(),
    ].filter((ingredient) => ingredient.trim() !== '');

    // First, check which food names can be matched
    const foodMatches = [];
    const unmatched = [];

    for (const foodName of foodNames) {
      const { data: searchResults } = await supabase.rpc('search_foods', {
        query: foodName,
        max: 1,
      });

      if (
        searchResults &&
        searchResults.length > 0 &&
        searchResults[0].best_similarity > 0.8
      ) {
        foodMatches.push({
          original: foodName,
          matched: searchResults[0].name,
          food_id: searchResults[0].food_id,
          similarity: searchResults[0].best_similarity,
        });
      } else {
        unmatched.push(foodName);
      }
    }

    matchedFoods.value = foodMatches;
    unmatchedFoods.value = unmatched;

    // Search for recipes if all foods were recognized
    if (foodMatches.length === foodNames.length) {
      const foundRecipes = await getRecipesByFoodNames(supabase, foodNames);
      recipes.value = foundRecipes;
    }
  } catch (error) {
    console.error('Error searching recipes:', error);
    // You might want to show an error message to the user
  } finally {
    loading.value = false;
  }
};

async function getRecipesByFoodNames(
  client: SupabaseClient,
  foodNames: string[]
): Promise<RecipeOverview[]> {
  console.log('🔍 getRecipesByFoodNames called with:', foodNames);

  if (foodNames.length === 0) return [];

  // First, find food_name_ids for each food name using search
  const foodNameResults: { id: number; food_id: number; name: string }[] = [];

  for (const foodName of foodNames) {
    console.log(`🔍 Searching for: "${foodName}"`);
    const { data: searchResults } = await client.rpc('search_foods', {
      query: foodName,
      max: 5,
    });

    console.log(`🔍 Search results for "${foodName}":`, searchResults);

    if (
      searchResults &&
      searchResults.length > 0 &&
      searchResults.some((result) => result.best_similarity > 0.8)
    ) {
      foodNameResults.push(...searchResults);
      console.log(
        `✅ Matched "${foodName}" → "${searchResults[0].name}" (food_id: ${searchResults[0].food_id})`
      );
    } else {
      console.log(`❌ No good match for "${foodName}"`);
    }
  }

  console.log('🔍 All food name results:', foodNameResults);

  if (foodNameResults.length !== foodNames.length) {
    console.log('❌ Not all food names were recognized');
    return [];
  }

  const targetFoodIds = foodNameResults.map((r) => r.food_id);
  console.log('🎯 Target food IDs:', targetFoodIds);

  // Find recipes that contain ALL of our target foods using a more efficient approach
  console.log('🔍 Finding recipes with all target foods...');

  // Get all food_name_ids that correspond to our target food_ids
  const { data: allFoodNames } = await client
    .from('food_names')
    .select('id, food_id')
    .in('food_id', targetFoodIds);

  console.log('🔍 All food names for target food_ids:', allFoodNames);

  if (!allFoodNames || allFoodNames.length === 0) {
    console.log('❌ No food names found for target food_ids');
    return [];
  }

  const allFoodNameIds = allFoodNames.map((fn) => fn.id);
  console.log('🔍 All food name IDs:', allFoodNameIds);

  // Find recipes that contain any of these food names
  const { data: recipeFoods } = await client
    .from('recipe_foods')
    .select('recipe_id, food_name_id')
    .in('food_name_id', allFoodNameIds);

  console.log('🔍 Recipe foods query result:', recipeFoods?.length, 'records');

  if (!recipeFoods || recipeFoods.length === 0) {
    console.log('❌ No recipe foods found');
    return [];
  }

  // Group by recipe_id and check which target foods each recipe contains
  const recipeFoodCounts: Record<number, Set<number>> = {};
  recipeFoods.forEach((rf) => {
    if (!recipeFoodCounts[rf.recipe_id]) {
      recipeFoodCounts[rf.recipe_id] = new Set();
    }

    // Find which food_id this food_name_id corresponds to
    const foodName = allFoodNames.find((fn) => fn.id === rf.food_name_id);
    if (foodName && targetFoodIds.includes(foodName.food_id)) {
      recipeFoodCounts[rf.recipe_id].add(foodName.food_id);
      console.log(
        `✅ Recipe ${rf.recipe_id} contains food_id ${foodName.food_id}`
      );
    }
  });

  console.log(
    '🔍 Recipe food counts:',
    Object.entries(recipeFoodCounts).map(([recipeId, foodIds]) => ({
      recipeId: parseInt(recipeId),
      foodIds: Array.from(foodIds),
      count: foodIds.size,
    }))
  );

  // Find recipes that contain ALL target foods
  const matchingRecipeIds = Object.entries(recipeFoodCounts)
    .filter(([_, foodIds]) => foodIds.size === targetFoodIds.length)
    .map(([recipeId, _]) => parseInt(recipeId));

  console.log('🎯 Matching recipe IDs:', matchingRecipeIds);
  console.log('🎯 Looking for recipes with all', targetFoodIds.length, 'foods');

  if (matchingRecipeIds.length === 0) {
    console.log('❌ No recipes found with all target foods');
    return [];
  }

  console.log('✅ Found', matchingRecipeIds.length, 'matching recipes');

  // Get the full recipe data for matching recipes
  return await getRecipeOverviews(client, {
    in: { id: matchingRecipeIds },
    limit: 20,
  });
}
</script>

<style scoped></style>
