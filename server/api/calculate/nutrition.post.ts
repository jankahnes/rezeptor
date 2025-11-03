import NutritionEngine from '~/server/utils/NutritionEngine';
import type { Food } from '~/types/types';

type NutritionEngineArgs = {
  food: Food;
  useGpt: boolean;
  logToReport: boolean;
  considerProcessing: boolean;
  temp_sidx: number;
};

type Response = {
  nutritionComputed: any;
  nutrition: any;
};

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { nutritionEngineArgs } = body as { nutritionEngineArgs: NutritionEngineArgs };
  const nutritionEngine = new NutritionEngine(
    nutritionEngineArgs.useGpt,
    nutritionEngineArgs.logToReport,
    nutritionEngineArgs.considerProcessing
  );
  const scores = await nutritionEngine.computeFood(nutritionEngineArgs.food, nutritionEngineArgs.temp_sidx);
  if (nutritionEngineArgs.logToReport) {
    nutritionEngine.generateReport();
  }
  const response: Response = {
    nutritionComputed: nutritionEngine.getRecipeRow(),
    nutrition: scores,
  };
  return response;
});
