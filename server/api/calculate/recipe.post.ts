import RecipeCalculator from '~/server/utils/RecipeCalculator';
import type {
  ComputableRecipe,
  InsertableRecipe,
  InsertableRecipeFood,
  InsertableRecipeTag,
} from '~/types/types';

type CalculatorArgs = {
  recipe: ComputableRecipe;
  useGpt: boolean;
  logToReport: boolean;
  considerProcessing: boolean;
  nutritionLabelOnly: boolean;
};

type Response = {
  recipeRow: InsertableRecipe | null;
  recipeFoodRows: Omit<InsertableRecipeFood, 'recipe_id'>[] | null;
  recipeTagRows: Omit<InsertableRecipeTag, 'recipe_id'>[] | null;
};

export default defineEventHandler(async (event): Promise<Response> => {
  const body = await readBody(event);
  const { calculatorArgs } = body as { calculatorArgs: CalculatorArgs };

  const recipeCalculator = new RecipeCalculator(
    calculatorArgs.useGpt,
    calculatorArgs.logToReport,
    calculatorArgs.considerProcessing,
    calculatorArgs.nutritionLabelOnly
  );
  await recipeCalculator.computeRecipe(calculatorArgs.recipe);

  if (calculatorArgs.nutritionLabelOnly) {
    return {
      recipeRow: recipeCalculator.getRecipeRow(),
      recipeFoodRows: null,
      recipeTagRows: null,
    };
  }

  if (recipeCalculator?.recipe?.scores?.hidx === undefined || isNaN(recipeCalculator?.recipe?.scores?.hidx)) {
    return {
      recipeRow: null,
      recipeFoodRows: null,
      recipeTagRows: null,
    };
  }
  const response: Response = {
    recipeRow: recipeCalculator.getRecipeRow(),
    recipeFoodRows: recipeCalculator.getRecipeFoodRows(),
    recipeTagRows: recipeCalculator.getRecipeTagRows(),
  };
  return response as Response;
});
