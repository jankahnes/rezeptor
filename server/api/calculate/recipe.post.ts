import NutritionEngine from '~/server/utils/NutritionEngine';
import type {
  ComputableRecipe,
  InsertableRecipe,
  InsertableRecipeFood,
  InsertableRecipeTag,
} from '~/types/types';

type NutritionEngineArgs = {
  recipe: ComputableRecipe;
  useGpt: boolean;
  logToReport: boolean;
  considerProcessing: boolean;
  nutritionLabelOnly: boolean;
  disableSatiety: boolean;
};

type Response = {
  recipeRow: InsertableRecipe | null;
  recipeFoodRows: Omit<InsertableRecipeFood, 'recipe_id'>[] | null;
  recipeTagRows: Omit<InsertableRecipeTag, 'recipe_id'>[] | null;
};

export default defineEventHandler(async (event): Promise<Response> => {
  const body = await readBody(event);
  const { nutritionEngineArgs } = body as { nutritionEngineArgs: NutritionEngineArgs };

  const nutritionEngine = new NutritionEngine(
    nutritionEngineArgs.useGpt,
    nutritionEngineArgs.logToReport,
    nutritionEngineArgs.considerProcessing,
    nutritionEngineArgs.nutritionLabelOnly,
    nutritionEngineArgs.disableSatiety
  );
  await nutritionEngine.computeRecipe(nutritionEngineArgs.recipe);

  if (nutritionEngineArgs.nutritionLabelOnly) {
    return {
      recipeRow: nutritionEngine.getRecipeRow(),
      recipeFoodRows: null,
      recipeTagRows: null,
    };
  }

  if (
    nutritionEngine?.recipe?.scores?.hidx === undefined ||
    isNaN(nutritionEngine?.recipe?.scores?.hidx)
  ) {
    return {
      recipeRow: null,
      recipeFoodRows: null,
      recipeTagRows: null,
    };
  }
  const response: Response = {
    recipeRow: nutritionEngine.getRecipeRow(),
    recipeFoodRows: nutritionEngine.getRecipeFoodRows(),
    recipeTagRows: nutritionEngine.getRecipeTagRows(),
  };
  return response as Response;
});
