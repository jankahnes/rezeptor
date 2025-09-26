import RecipeCalculator from "~/server/utils/RecipeCalculator";

type CalculatorArgs = {
  recipe: any;
  useGpt: boolean;
  logToReport: boolean;
  isFood: boolean;
  considerProcessing: boolean;
}

type Response = {
    recipeComputed: any;
    recipeFoodRows: any;
    recipeTagRows: any;
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { calculatorArgs } = body as { calculatorArgs: CalculatorArgs };
  
  const recipeCalculator = new RecipeCalculator(calculatorArgs.recipe, calculatorArgs.useGpt, calculatorArgs.logToReport, calculatorArgs.isFood, calculatorArgs.considerProcessing);
  await recipeCalculator.computeRecipe();
  if(!calculatorArgs.recipe || recipeCalculator.ingredientsFlat.length === 0) {
    return {
      recipeComputed: {},
      recipeFoodRows: [],
      recipeTagRows: [],
    }
  }
  const response: Response = {
    recipeComputed: recipeCalculator.recipeComputed,
    recipeFoodRows: recipeCalculator.getRecipeFoodRows(),
    recipeTagRows: recipeCalculator.getRecipeTagRows(),
  };
  return response as Response;
});
