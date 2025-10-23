<template>
  <div class="flex gap-8 h-66 flex-wrap">
    <div
      class="flex flex-col gap-2 items-start justify-between w-full max-w-120"
    >
      <textarea
        v-model="text"
        placeholder="1/4 Banana
100g of Flour
2 tbsp of Oil
      "
        class="w-full min-h-40 resize-none border border-dashed border-primary rounded-lg p-2"
      ></textarea>
      <button
        class="button px-4 py-1 font-bold text-white !bg-primary rounded-lg flex items-center gap-2"
        @click="showDemo"
      >
        <span class="material-symbols-outlined !text-lg">auto_awesome</span>
        Generate Instant Nutrition Label
      </button>
    </div>
    <NutritionLabel
      v-if="recipe"
      :nutritionData="recipe"
      :headless="true"
      class="max-w-120"
    />
  </div>
</template>

<script setup>
const text = ref('');
const recipe = ref(null);
const supabase = useSupabaseClient();

const showDemo = async () => {
  const splitText = text.value.split(/[\n,;]+/);
  const computableRecipe = {
    fullIngredients: [],
    serves: 1,
  };
  for (const line of splitText) {
    const parsed = await parseIngredientString(supabase, line);
    if (!parsed.ingredient) {
      continue;
    }
    computableRecipe.fullIngredients.push({
      amount: parsed.amount,
      unit: parsed.unit,
      ...parsed.ingredient.food,
    });
  }
  console.log(computableRecipe);
  const response = await $fetch('/api/calculate/recipe', {
    method: 'POST',
    body: {
      calculatorArgs: {
        recipe: computableRecipe,
        useGpt: false,
        logToReport: false,
        considerProcessing: false,
        nutritionLabelOnly: true,
      },
    },
  });
  recipe.value = response.recipeRow;
};
</script>

<style scoped></style>
