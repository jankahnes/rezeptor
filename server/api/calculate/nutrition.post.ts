import RecipeCalculator from '~/server/utils/RecipeCalculator';
import type { Food } from '~/types/types';

type CalculatorArgs = {
  food: Food;
  useGpt: boolean;
  logToReport: boolean;
  considerProcessing: boolean;
};

type Response = {
  nutritionComputed: any;
  nutrition: any;
};

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { calculatorArgs } = body as { calculatorArgs: CalculatorArgs };
  const recipeCalculator = new RecipeCalculator(
    calculatorArgs.useGpt,
    calculatorArgs.logToReport,
    calculatorArgs.considerProcessing
  );
  const scores = await recipeCalculator.computeFood(calculatorArgs.food);
  Object.assign(recipeCalculator.recipe, scores);
  if (calculatorArgs.logToReport) {
    recipeCalculator.generateReport();
  }
  const response: Response = {
    nutritionComputed: recipeCalculator.recipe,
    nutrition: scores,
  };
  return response;
});
