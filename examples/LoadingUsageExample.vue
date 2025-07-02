<template>
  <div class="p-4">
    <h2 class="text-xl font-bold mb-4">Loading Usage Example</h2>

    <!-- This shows the correct way to use global loading -->
    <div class="space-y-4">
      <button
        @click="loadRecipes"
        :disabled="isRecipesLoading"
        class="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
      >
        {{ isRecipesLoading ? 'Loading...' : 'Load Recipes' }}
      </button>

      <button
        @click="loadRecipe"
        :disabled="isRecipeLoading"
        class="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-400"
      >
        {{ isRecipeLoading ? 'Loading...' : 'Load Recipe' }}
      </button>

      <button
        @click="manualOperation"
        :disabled="false"
        class="px-4 py-2 bg-purple-500 text-white rounded"
      >
        Manual Operation
      </button>
    </div>

    <!-- Display results -->
    <div v-if="results.length > 0" class="mt-4">
      <h3 class="font-semibold">Results:</h3>
      <ul class="list-disc list-inside">
        <li v-for="result in results" :key="result.id">
          {{ result }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
// Use your existing composables
const {
  data: recipes,
  pending: recipesPending,
  refresh: refreshRecipes,
} = await useRecipesPartial(() => ({}));
const {
  data: recipe,
  pending: recipePending,
  refresh: refreshRecipe,
} = await useRecipe();

// Track loading states globally
const { trackLoading } = useGlobalLoading();

// Track the loading states
trackLoading('recipes-partial', recipesPending);
trackLoading('recipe', recipePending);

// Computed properties for UI
const isRecipesLoading = computed(() => recipesPending.value);
const isRecipeLoading = computed(() => recipePending.value);

// Results storage
const results = ref<string[]>([]);

// Example functions
const loadRecipes = async () => {
  await refreshRecipes(); // This will trigger the loading state
  results.value.push(`Loaded ${recipes.value?.length || 0} recipes`);
};

const loadRecipe = async () => {
  await refreshRecipe(); // This will trigger the loading state
  results.value.push('Recipe refreshed');
};

const manualOperation = async () => {
  // You can also use the withLoading helper for manual operations
  const { withLoading } = useGlobalLoading();

  const result = await withLoading('manual-operation', async () => {
    // Simulate some async operation
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return 'Manual operation completed';
  });

  results.value.push(result);
};
</script>
