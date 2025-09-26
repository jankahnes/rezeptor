import RecipeCalculator from "~/server/utils/RecipeCalculator";

type CalculatorArgs = {
  recipe: any;
  useGpt: boolean;
  logToReport: boolean;
  isFood: boolean;
  considerProcessing: boolean;
}

type Response = {
    nutritionComputed: any;
    report?: any;
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { calculatorArgs } = body as { calculatorArgs: CalculatorArgs };
  const recipeCalculator = new RecipeCalculator(calculatorArgs.recipe, calculatorArgs.useGpt, calculatorArgs.logToReport, calculatorArgs.isFood, calculatorArgs.considerProcessing);
  const scores = await recipeCalculator.getScoring();
  Object.assign(recipeCalculator.recipeComputed, scores);
    if(calculatorArgs.logToReport) {
    recipeCalculator.generateReport();
    }
  const response: Response = {
    nutritionComputed: recipeCalculator.recipeComputed,
    nutrition: scores,
    report: calculatorArgs.logToReport ? recipeCalculator.report : undefined,
  };
  return response;
});
