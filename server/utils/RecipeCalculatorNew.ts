import { callAlphaFunction, alphaFunctions } from '~/server/utils/alphas';

import { recipeKeys } from '~/types/keys';
import stripKeys from '~/utils/format/stripKeys';
import convertToGrams from '~/utils/format/convertToGrams';
import { getGrade } from '~/utils/constants/grades';
import getReportHumanReadable from '~/server/utils/reportHumanReadable/getReportHumanReadable';
import { vegetableOilData } from '~/utils/constants/vegetableOil';
import type {
  ComputableRecipe,
  ComputedRecipe,
  ComputedRecipeScores,
  Food,
  FullIngredient,
  cumulativeKeys,
  InsertableRecipe,
  GptMetadataResponse,
  Recipe,
  InsertableRecipeFood,
  InsertableRecipeTag,
  MechanicalDisruption,
} from '~/types/types';

type GptInformation = {
  tags: number[];
  processing: {
    ingredient_id: number | string;
    thermal_intensity: string;
    heat_medium: string;
    mechanical_disruption: number;
  }[];
  ingredients_not_fully_consumed: {
    ingredient_id: number | string;
    consumption_factor: number;
  }[];
};

const micronutrient_weights = [
  { name: 'iron_mg', weight: 1.5, rda: 8.0 },
  { name: 'magnesium_mg', weight: 1.2, rda: 400.0 },
  { name: 'zinc_mg', weight: 1.0, rda: 10.0 },
  { name: 'calcium_mg', weight: 1.0, rda: 1000.0 },
  { name: 'potassium_mg', weight: 1.3, rda: 4700.0 },
  { name: 'selenium_ug', weight: 0.5, rda: 55 },
  { name: 'iodine_ug', weight: 0.7, rda: 150 },
  { name: 'copper_mg', weight: 0.3, rda: 0.9 },
  { name: 'manganese_mg', weight: 0.2, rda: 2.3 },
  { name: 'vitamin_a_ug_rae', weight: 0.8, rda: 900 },
  { name: 'vitamin_c_mg', weight: 1.0, rda: 80.0 },
  { name: 'vitamin_d_ug', weight: 1.5, rda: 15 },
  { name: 'vitamin_e_mg_alpha_te', weight: 0.6, rda: 15.0 },
  { name: 'vitamin_k_ug', weight: 0.4, rda: 100 },
  { name: 'thiamine_b1_mg', weight: 0.5, rda: 1.2 },
  { name: 'riboflavin_b2_mg', weight: 0.4, rda: 1.1 },
  { name: 'niacin_b3_mg', weight: 0.5, rda: 15.0 },
  { name: 'vitamin_b6_mg', weight: 0.6, rda: 1.3 },
  { name: 'folate_ug_dfe', weight: 1.2, rda: 400 },
  { name: 'vitamin_b12_ug', weight: 1.4, rda: 2.4 },
];

export default class RecipeCalculatorNew {
  recipe!: ComputedRecipe;
  food!: Food;

  considerProcessing = false;
  useGpt = false;
  logToReport = false;

  gptInformation: GptInformation = {
    tags: [],
    processing: [],
    ingredients_not_fully_consumed: [],
  };

  targetSalt = 0;
  isFood = false;
  report: any = {};
  serving_kcal = 0;

  cumulativeFields = Object.keys(alphaFunctions) as cumulativeKeys[];

  UNUSUAL_KCAL_THRESHOLD = 2000;
  MOVER_DISPLAY_LIMIT = 3; // Max movers to display per category
  MOVER_THRESHOLD = 0.04; // Minimum 4% change to display

  // Nutrient display names for reporting
  nutrientDisplayNames = {
    vitamin_c_mg: 'Vitamin C',
    vitamin_a_ug_rae: 'Vitamin A',
    vitamin_d_ug: 'Vitamin D',
    vitamin_e_mg_alpha_te: 'Vitamin E',
    vitamin_k_ug: 'Vitamin K',
    thiamine_b1_mg: 'Vitamin B1',
    riboflavin_b2_mg: 'Vitamin B2',
    niacin_b3_mg: 'Vitamin B3',
    vitamin_b6_mg: 'Vitamin B6',
    folate_ug_dfe: 'Vitamin B9',
    vitamin_b12_ug: 'Vitamin B12',
    iron_mg: 'Iron',
    magnesium_mg: 'Magnesium',
    zinc_mg: 'Zinc',
    calcium_mg: 'Calcium',
    potassium_mg: 'Potassium',
    selenium_ug: 'Selenium',
    iodine_ug: 'Iodine',
    copper_mg: 'Copper',
    manganese_mg: 'Manganese',
    omega3_total_mg: 'Omega-3',
    omega6_total_mg: 'Omega-6',
    mufas_total_mg: 'MUFA',
    histidine_mg: 'Histidine',
    isoleucine_mg: 'Isoleucine',
    leucine_mg: 'Leucine',
    lysine_mg: 'Lysine',
    methionine_mg: 'Methionine',
    cysteine_mg: 'Cysteine',
    phenylalanine_mg: 'Phenylalanine',
    tyrosine_mg: 'Tyrosine',
    threonine_mg: 'Threonine',
    tryptophan_mg: 'Tryptophan',
    valine_mg: 'Valine',
    polyphenols: 'Polyphenols',
    glucosinolates: 'Glucosinolates',
    carotenoids: 'Carotenoids',
    choline_mg: 'Choline',
  };

  constructor(useGpt = false, logToReport = false, considerProcessing = false) {
    this.useGpt = useGpt;
    this.logToReport = logToReport;
    this.considerProcessing = considerProcessing;
    if (this.logToReport) {
      this.initializeReport();
    }
  }

  initializeCumulativeFields(recipe: any) {
    for (const field of this.cumulativeFields) {
      recipe[field] = {
        totalBeforeAlpha: 0,
        total: 0,
        per100: 0,
        alphaFunction: alphaFunctions[field],
        contributors: [],
      };
    }
  }

  async computeRecipe(recipe: ComputableRecipe) {
    this.isFood = false;
    const computedRecipe: any = {
      total_weight: 0,
      saltiness: 1,
      added_salt: 0,
      added_fat: 0,
      effort: 'MODERATE',
      difficulty: 'MEDIUM',
      yield_factor: 1,
      ...recipe,
    };

    this.initializeCumulativeFields(computedRecipe);
    this.recipe = computedRecipe as ComputedRecipe;

    if (this.useGpt) {
      console.log('🔍 Starting GPT');
      const gptResponse = (await $fetch('/api/gpt/get-full-recipe-metadata', {
        method: 'POST',
        body: {
          recipe: this.recipe,
          considerProcessing: this.considerProcessing,
          baseTotalWeight: this.getBaseTotalWeight(),
        },
      })) satisfies GptMetadataResponse;
      this.recipe.saltiness = gptResponse.salt_and_fat.saltiness || 1;
      this.recipe.added_fat = gptResponse.salt_and_fat.added_fat || 0;
      this.recipe.added_salt = 0; // Will be calculated later
      this.recipe.difficulty = gptResponse.general.difficulty || 'MEDIUM';
      this.recipe.effort = gptResponse.general.effort || 'MODERATE';
      this.recipe.yield_factor =
        gptResponse.hydration.overall_yield_multiplier || 1;
      this.gptInformation.tags = gptResponse.general.tags || [];
      this.gptInformation.processing =
        gptResponse.processing.processing_info || [];
      this.gptInformation.ingredients_not_fully_consumed =
        gptResponse.hydration.ingredients_not_fully_consumed || [];
    }
    if (this.recipe.saltiness == 0) {
      this.targetSalt = 0.1;
    } else if (this.recipe.saltiness == 1) {
      this.targetSalt = 0.5;
    } else if (this.recipe.saltiness == 2) {
      this.targetSalt = 1.0;
    } else if (this.recipe.saltiness == 3) {
      this.targetSalt = 1.6;
    }

    // fill ingredients with GPT information
    this.processIngredients();

    // return if no ingredients with amount > 0
    if (this.recipe.fullIngredients.length === 0) {
      return;
    }

    // add up cumulative fields
    this.getCumulativeData(this.recipe.fullIngredients);

    // adjust batch size if it's smaller than serves
    if (this.recipe.batch_size && this.recipe.batch_size < this.recipe.serves) {
      this.recipe.batch_size = this.recipe.serves;
    }

    this.serving_kcal = this.recipe.kcal.total;

    console.log('🔍 Starting scoring');
    const scores = await this.getScoring();
    this.recipe.scores = scores;

    this.recipe.kcal.total = Math.round(this.recipe.kcal.total);
    this.recipe.total_weight = Math.round(this.recipe.total_weight);

    if (this.recipe.total_weight > 1200) {
      this.addNote(
        'Total weight is extremely high at ' + this.recipe.total_weight + 'g'
      );
    } else if (this.recipe.total_weight > 800) {
      this.addNote(
        'Total weight is unusually high at ' + this.recipe.total_weight + 'g'
      );
    }
    if (this.logToReport) {
      this.generateReport();
    }
  }

  async computeFood(food: Food) {
    this.isFood = true;
    this.serving_kcal =
      ((food.food.countable_units?.serving ||
        food.food.countable_units?.servings ||
        100) *
        food.food.kcal) /
      100;
    const foodAsRecipe: any = {
      title: food.name,
      user_id: null,
      publish: false,
      source_type: 'TITLE',
      ingredients: [],
      instructions: [],
      description: null,
      serves: 1,
      fullIngredients: [],
    };
    foodAsRecipe.total_weight = 100;
    for (const field of this.cumulativeFields) {
      foodAsRecipe[field] = {
        totalBeforeAlpha: food.food[field],
        total: food.food[field],
        per100: food.food[field],
      };
    }
    this.recipe = foodAsRecipe as ComputedRecipe;
    this.recipe.scores = await this.getScoring();
    return this.recipe.scores;
  }

  initializeReport() {
    this.report = {
      overall: {},
      micronutrients: {},
      fatProfile: {},
      protectiveCompounds: {},
      protein: {},
      processingEffects: [],
      ingredientNutrients: [],
    };
  }

  addNote(note: string) {
    if (!this.recipe) {
      return;
    }
    if (!this.recipe.notes) {
      this.recipe.notes = [];
    }
    this.recipe.notes.push(note);
  }

  processIngredients() {
    if (!this.recipe) {
      return;
    }
    // filter ingredients with amount = 0
    const ingredients = this.recipe.fullIngredients.filter(
      (ingredient) => ingredient.amount && ingredient.amount !== 0
    );
    for (const ingredient of ingredients) {
      if (this.useGpt) {
        const gptIngredientInfo = this.gptInformation.processing.find(
          (info) => Number(info.ingredient_id) === Number(ingredient.id)
        );
        const gptConsumptionInfo =
          this.gptInformation.ingredients_not_fully_consumed.find(
            (info) => Number(info.ingredient_id) === Number(ingredient.id)
          );
        if (gptConsumptionInfo) {
          ingredient.consumption_factor =
            gptConsumptionInfo.consumption_factor ?? 1;
        }
        if (gptIngredientInfo) {
          Object.assign(ingredient, gptIngredientInfo);
        }
      }
    }

    if (this.recipe.added_fat && this.recipe.added_fat > 0) {
      const oilIngredient = {
        ...vegetableOilData,
        amount: this.recipe.added_fat, // in grams
        unit: 'G',
        consumption_factor: 1,
        thermal_intensity: null,
        heat_medium: null,
        mechanical_disruption: '0',
        thermal_description: null,
        mechanical_description: null,
        utility: true,
        category: null,
        preparation_description: null,
      } as FullIngredient;
      this.recipe.fullIngredients.push(oilIngredient);
    }
    this.recipe.fullIngredients = ingredients;
  }

  getRecipeRow(): InsertableRecipe {
    const recipeRow = { ...this.recipe };
    for (const field of this.cumulativeFields) {
      recipeRow[field] = this.recipe[field].total;
    }
    Object.assign(recipeRow, this.recipe.scores);
    if (!this.isFood) {
      return stripKeys(recipeRow, recipeKeys) as InsertableRecipe;
    }
    return recipeRow as unknown as InsertableRecipe;
  }

  getRecipeFoodRows(): Omit<InsertableRecipeFood, 'recipe_id'>[] {
    const recipeFoods = [];
    for (const ingredient of this.recipe.fullIngredients) {
      if (ingredient.amount && ingredient.amount !== 0 && !ingredient.utility) {
        recipeFoods.push({
          food_name_id: ingredient.id,
          unit: ingredient.unit,
          amount: ingredient.amount / this.recipe.serves,
          category: ingredient.category,
          thermal_intensity: ingredient.thermal_intensity || null,
          heat_medium: ingredient.heat_medium || null,
          mechanical_disruption: ingredient.mechanical_disruption ?? 0,
          thermal_description: ingredient.thermal_description || null,
          mechanical_description: ingredient.mechanical_description || null,
          consumption_factor: Number(ingredient.consumption_factor ?? 1),
          preparation_description: ingredient.preparation_description || null,
        });
      }
    }
    return recipeFoods as Omit<InsertableRecipeFood, 'recipe_id'>[];
  }

  getRecipeTagRows(): Omit<InsertableRecipeTag, 'recipe_id'>[] {
    const tagRows = [];
    if (this.gptInformation.tags) {
      for (const tag of this.gptInformation.tags) {
        // general tags by GPT
        tagRows.push({
          tag_id: tag,
        });
      }
    }
    if (this.recipe.fullIngredients.length < 5) {
      // few ingredients
      tagRows.push({
        tag_id: 1,
      });
    }
    if (this.recipe.effort === 'LIGHT') {
      // light effort
      tagRows.push({
        tag_id: 2,
      });
    }
    if (this.recipe.difficulty === 'EASY') {
      // easy difficulty
      tagRows.push({
        tag_id: 3,
      });
    }
    if (this.recipe.price.total < 1) {
      // budget
      tagRows.push({
        tag_id: 4,
      });
    }
    if (this.recipe.scores.hidx > 70) {
      // healthy
      tagRows.push({
        tag_id: 100,
      });
    }
    if (this.recipe.scores.mnidx > 70) {
      // nutritious
      tagRows.push({
        tag_id: 101,
      });
    }
    if (this.recipe.fullIngredients.every((ingredient) => ingredient.vegan)) {
      // vegan
      tagRows.push({
        tag_id: 102,
      });
    }
    if (
      this.recipe.fullIngredients.every((ingredient) => ingredient.vegetarian)
    ) {
      // vegetarian
      tagRows.push({
        tag_id: 103,
      });
    }
    if (
      this.recipe.fullIngredients.every((ingredient) => ingredient.lactose_free)
    ) {
      // lactose-free
      tagRows.push({
        tag_id: 112,
      });
    }
    if (this.recipe.protein.total > 35) {
      // high protein
      tagRows.push({
        tag_id: 104,
      });
    }
    if (this.recipe.carbohydrates.per100 < 10) {
      // low carb
      tagRows.push({
        tag_id: 105,
      });
    }
    if (
      this.recipe.fullIngredients.every((ingredient) => ingredient.gluten_free)
    ) {
      // gluten-free
      tagRows.push({
        tag_id: 107,
      });
    }
    if (this.recipe.kcal.total < 600 && this.recipe.kcal.per100 < 300) {
      // low calorie
      tagRows.push({
        tag_id: 108,
      });
    }
    if (this.recipe.scores.satiety > 70) {
      // high satiety
      tagRows.push({
        tag_id: 109,
      });
    }
    if (this.recipe.fat.per100 < 3) {
      // low fat
      tagRows.push({
        tag_id: 110,
      });
    }
    if (this.recipe.fiber.per100 > 6) {
      // high fiber
      tagRows.push({
        tag_id: 111,
      });
    }
    const netCarbs =
      this.recipe.carbohydrates.per100 - this.recipe.fiber.per100;
    if (netCarbs <= 5.5) {
      // keto (account for untracked sugar alcohols with +0.5)
      tagRows.push({
        tag_id: 113,
      });
    }
    if (this.recipe.salt.per100 < 0.3) {
      // low sodium
      tagRows.push({
        tag_id: 114,
      });
    }
    if (this.recipe.sugar.per100 < 5) {
      // low sugar
      tagRows.push({
        tag_id: 115,
      });
    }
    return tagRows as Omit<InsertableRecipeTag, 'recipe_id'>[];
  }

  getBaseTotalWeight() {
    let totalWeight = 0;
    for (const ingredient of this.recipe!.fullIngredients) {
      totalWeight += convertToGrams(
        ingredient.amount,
        ingredient.unit,
        ingredient.density,
        ingredient.countable_units?.[ingredient.unit] ?? 0
      );
    }
    return totalWeight / this.recipe!.serves;
  }

  getCumulativeData(ingredients: FullIngredient[]) {
    this.recipe.total_weight = 0;

    // First pass: calculate basic totals and weight
    for (const ingredient of ingredients) {
      const unit_weight = ingredient?.countable_units?.[ingredient.unit] ?? 0;
      const originalGrams =
        convertToGrams(
          ingredient.amount,
          ingredient.unit,
          ingredient.density,
          unit_weight
        ) / this.recipe.serves;
      this.recipe.total_weight += originalGrams; // total_weight gets multiplied by yield factor later, where consumption is already accounted for

      // Apply consumption factor for nutrient calculations
      const consumptionFactor = ingredient.consumption_factor ?? 1;
      const consumedGrams = originalGrams * consumptionFactor;

      // For total nutrients, use consumed weight
      const nutrientFactor = consumedGrams / 100;

      for (const field of this.cumulativeFields) {
        const nutrientValue = ingredient[field] || 0;
        this.recipe[field].totalBeforeAlpha += nutrientValue * nutrientFactor;
      }

      if (this.logToReport) {
        const ingredientNutrients = {} as Record<cumulativeKeys, number>;
        for (const field of this.cumulativeFields) {
          const nutrientValue = ingredient[field] || 0;
          ingredientNutrients[field] = nutrientValue * nutrientFactor;
        }
        this.report.ingredientNutrients.push({
          name: ingredient.name,
          weight: originalGrams, // Display original weight
          consumedWeight: consumedGrams, // Track consumed weight for calculations
          nutrients: ingredientNutrients,
          processing: {
            thermal_intensity: ingredient.thermal_intensity,
            heat_medium: ingredient.heat_medium,
            mechanical_disruption: ingredient.mechanical_disruption,
            thermal_description: ingredient.thermal_description,
            mechanical_description: ingredient.mechanical_description,
          },
        });
      }
    }

    this.recipe.total_weight =
      this.recipe.total_weight * this.recipe.yield_factor;

    // Calculate per-100g intrinsic salt to compare with target
    const intrinsicSaltPer100g =
      (this.recipe.salt.totalBeforeAlpha / this.recipe.total_weight) * 100;

    // If intrinsic salt is below target, add salt to reach target
    if (intrinsicSaltPer100g < this.targetSalt) {
      const targetSaltTotal =
        (this.targetSalt * this.recipe.total_weight) / 100;
      this.recipe.added_salt =
        targetSaltTotal - this.recipe.salt.totalBeforeAlpha;
      this.recipe.salt.totalBeforeAlpha = targetSaltTotal;
    } else {
      this.recipe.added_salt = 0;
    }

    const nutrientsPer100 = {} as Record<cumulativeKeys, number>;
    // Calculate per-100g values for alpha function input
    for (const field of this.cumulativeFields) {
      nutrientsPer100[field] =
        (this.recipe[field].totalBeforeAlpha / this.recipe.total_weight) * 100;
    }
    // Second pass: apply alpha functions to individual ingredient contributions
    for (const ingredient of ingredients) {
      const unit_weight = ingredient?.countable_units?.[ingredient.unit] ?? 0;
      const originalGrams =
        convertToGrams(
          ingredient.amount,
          ingredient.unit,
          ingredient.density,
          unit_weight
        ) / this.recipe.serves;

      const consumptionFactor = ingredient.consumption_factor ?? 1;
      const consumedGrams = originalGrams * consumptionFactor;
      const nutrientFactor = consumedGrams / 100;

      for (const field of this.cumulativeFields) {
        let alpha = callAlphaFunction(
          this.recipe[field].alphaFunction,
          nutrientsPer100,
          ingredient.thermal_intensity,
          ingredient.heat_medium,
          ingredient.mechanical_disruption
        );

        const nutrientValue = ingredient[field] || 0;
        const total = nutrientValue * nutrientFactor;
        const per100 = (total / this.recipe.total_weight) * 100;
        const contributionPercentage =
          Math.round((total / this.recipe[field].totalBeforeAlpha) * 100) / 100;
        if (field == 'sugar') {
          this.recipe[field].contributors.push({
            name: ingredient.name,
            value: contributionPercentage,
            totalContribution: total,
            processingLevel: ingredient.nova,
          });
        } else if (contributionPercentage > 0.1 || field == 'kcal') {
          this.recipe[field].contributors.push({
            name: ingredient.name,
            value: contributionPercentage,
            totalContribution: total,
          });
        }
        this.recipe[field].total += alpha * total;
        this.recipe[field].per100 += alpha * per100;
      }
    }
    // sanity check for unusually high serving sizes
    // proposed: recursive approach to increase serving size until its reasonable
    if (
      this.recipe.total_weight > 1500 ||
      this.recipe.kcal.total > this.UNUSUAL_KCAL_THRESHOLD
    ) {
      this.UNUSUAL_KCAL_THRESHOLD = 800;
      const probableYieldSizes = [2, 3, 4, 5, 6, 8, 10, 12, 15, 18, 24];
      const nextBiggest = probableYieldSizes.find(
        (size) => size > this.recipe.serves
      );
      if (!nextBiggest) {
        throw new Error('Serving size is too large');
      }
      this.recipe.serves = nextBiggest;
      this.initializeCumulativeFields(this.recipe);
      this.getCumulativeData(this.recipe.fullIngredients);
    }

    for (const col of this.cumulativeFields) {
      if (this.recipe[col].contributors) {
        this.recipe[col].contributors.sort(
          (a: any, b: any) => b.value - a.value
        );
      }
    }
    if (this.logToReport) {
      this.report.contributors = this.recipe;
    }
  }

  async getScoring(): Promise<ComputedRecipeScores> {
    const processing_level_factor = this.recipe.nova.per100 <= 2 ? 0.8 : 1.4;
    const water = Math.max(
      0,
      100 -
        (this.recipe.protein.per100 +
          this.recipe.fat.per100 +
          this.recipe.carbohydrates.per100 +
          this.recipe.fiber.per100 +
          processing_level_factor)
    );

    const ed = this.getED();
    const sidx = await this.getSIDX(water);
    const mnidx = this.getMNIDX();
    const fiber_score = this.getFiberScore();
    const protein_score = this.getProteinScoreOvr();
    const salt_score = this.getSaltScore();
    const sugar_score = this.getSugarScore();
    const fat_profile_score = this.getFatProfileScore();
    const protective_score = this.getProtectiveCompoundScore();
    const processing_level_score = this.getPLScore();
    const satiety = 0.5 * ed + 0.5 * sidx;
    const hidx = this.getHIDX(
      satiety,
      protein_score,
      fiber_score,
      sugar_score,
      fat_profile_score,
      salt_score,
      mnidx,
      processing_level_score,
      protective_score
    );

    // Store detailed scoring data for reporting
    if (this.logToReport) {
      this.report.scoringDetails = {
        ed,
        sidx,
        satiety,
        mnidx,
        fiber_score,
        protein_score,
        salt_score,
        sugar_score,
        fat_profile_score,
        protective_score,
        processing_level_score,
        hidx,
      };
    }

    const scores: ComputedRecipeScores = {
      hidx: Math.round(hidx),
      sidx: Math.round(sidx),
      fiber_score: Math.round(fiber_score),
      protein_score: Math.max(0, Math.min(110, Math.round(protein_score))),
      salt_score: Math.max(0, Math.min(100, Math.round(salt_score))),
      sugar_score: Math.max(0, Math.min(100, Math.round(sugar_score))),
      fat_profile_score: Math.round(fat_profile_score),
      mnidx: Math.max(0, Math.min(110, Math.round(mnidx))),
      satiety: Math.round(satiety),
      processing_level_score: Math.round(processing_level_score),
      protective_score: Math.round(protective_score),
    };
    return scores;
  }

  scaleWithPoints(value: number, points: [number, number][]) {
    if (value <= points[0][0]) {
      return points[0][1];
    }
    if (value >= points[points.length - 1][0]) {
      return points[points.length - 1][1];
    }
    for (let i = 0; i < points.length - 1; i++) {
      const x1 = points[i][0];
      const y1 = points[i][1];
      const x2 = points[i + 1][0];
      const y2 = points[i + 1][1];
      if (x1 <= value && value <= x2) {
        return y1 + ((value - x1) * (y2 - y1)) / (x2 - x1);
      }
    }
    return 0;
  }

  scaleWithCurve(x: number) {
    if (x > 1) {
      return 0;
    } else {
      return 0.2 * Math.exp(-5 * x);
    }
  }

  saturate(nutrientValuePer2000Kcal: number, nutrientRDA: number): number {
    const nutrient_per_serving =
      nutrientValuePer2000Kcal * (this.serving_kcal / 2000);
    const rda_ratio = nutrient_per_serving / nutrientRDA;
    return (nutrientValuePer2000Kcal * 1.5) / (0.5 + rda_ratio);
  }

  getMNIDX() {
    let perKcalScore = 0;
    const micronutrientDetails: {
      name: string;
      displayName: string;
      value: number;
      rdaPerServing: number;
      rdaPer100: number;
      perKcalContribution: number;
    }[] = [];

    for (const nutrient of micronutrient_weights) {
      const name = nutrient.name as cumulativeKeys;
      const weight = nutrient.weight;
      const rda = nutrient.rda;

      const rawValue = this.recipe[name].per100 || 0;

      // Linear per-kcal: extrapolate to 2000kcal, calculate %RDA, apply weight
      // Anchors: 0%=0, 100%=100, 200%=200 (linear)
      const nutrientPer2000kcal = (rawValue * 2000) / this.recipe.kcal.per100;
      const rdaPercent = (nutrientPer2000kcal / rda) * 100;
      const perKcalContribution = weight * rdaPercent;
      perKcalScore += perKcalContribution;

      // perServingContribution: nutrients per 500g of food

      if (this.logToReport && perKcalContribution > 0) {
        micronutrientDetails.push({
          name,
          displayName:
            this.nutrientDisplayNames[
              name as keyof typeof this.nutrientDisplayNames
            ] || name,
          value: Math.round(rawValue * 100) / 100,
          rdaPerServing: Math.round(
            (rawValue * this.recipe.total_weight) / rda
          ),
          rdaPer100: Math.round((rawValue * 100) / rda),
          perKcalContribution: perKcalContribution,
        });
      }
    }
    const scaledPerKcalScore = perKcalScore / micronutrient_weights.length;

    if (this.logToReport) {
      micronutrientDetails.sort(
        (a, b) => b.perKcalContribution - a.perKcalContribution
      );
      this.report.micronutrients = {
        total_score: scaledPerKcalScore,
        grade: getGrade(scaledPerKcalScore, 'single'),
        details: micronutrientDetails,
      };
    }

    return scaledPerKcalScore;
  }

  async getSIDX(water: number) {
    if (this.recipe.kcal.per100 == 0) {
      return 50;
    }
    const liquid_keywords = [
      'juice',
      'liquid',
      'broth',
      'soda',
      'smoothie',
      'drink',
      'tea',
      'coffee',
      'milk',
      'water',
      'cola',
      'beer',
      'wine',
      'cocktail',
    ];

    const is_liquid_whole_word = (name: string) => {
      const words = name.toLowerCase().split(' ');
      const words_cleaned = words.map((word) => word.replace(/[^\w\s]/g, ''));
      return liquid_keywords.some((kw) => words_cleaned.includes(kw));
    };

    let waterE = water;
    if (is_liquid_whole_word(this?.recipe?.title ?? '')) {
      waterE = waterE * 0.1;
    } else if (this.recipe.nova.per100 <= 2) {
      waterE = waterE;
    } else if (
      this.recipe.kcal.per100 > 10 &&
      waterE / this.recipe.kcal.per100 > 5
    ) {
      waterE = waterE * 0.9;
    } else {
      const sigmoid =
        1 /
        (1 +
          Math.exp(
            -2 *
              (this.recipe.carbohydrates.per100 -
                this.recipe.sugar.per100 +
                this.recipe.fiber.per100 +
                0.2929598406929533 * this.recipe.protein.per100 -
                1.054166862782954)
          ));
      waterE = waterE * sigmoid;
    }
    const starch_grams = Math.max(
      0,
      this.recipe.carbohydrates.per100 -
        this.recipe.sugar.per100 -
        this.recipe.fiber.per100
    );
    const giProxy =
      (1.2693123441054426 * this.recipe.sugar.per100 + starch_grams) /
      (this.recipe.carbohydrates.per100 + 1e-6);
    let ff = 0;
    if (this.recipe.kcal.per100 == 0) {
      ff = 0;
    } else {
      ff = Math.min(
        5,
        Math.max(
          0.5,
          41.7 / this.recipe.kcal.per100 ** 0.7 +
            0.05 * this.recipe.protein.per100 +
            0.000617 * this.recipe.fiber.per100 ** 3 -
            0.00000725 * this.recipe.fat.per100 ** 3 +
            0.617
        )
      );
    }

    if (this.logToReport) {
      this.report.satiety = {
        ff: ff,
        giProxy: Math.round((giProxy - 0.9) * 100),
        water: water,
        kcal: this.recipe.kcal.per100,
      };
    }

    const body = {
      ff: ff,
      giProxy: giProxy,
      waterE: waterE,
      kcal: this.recipe.kcal.per100,
    };

    const prediction = (await $fetch('/api/predict/satiety', {
      method: 'POST',
      body: body,
    })) satisfies { prediction: number };
    return this.scaleWithPoints(prediction.prediction, [
      [10, 0],
      [40, 50],
      [50, 72],
      [60, 80],
      [93, 100],
    ]);
  }

  getFiberScore() {
    const fiberPerDay =
      (this.recipe.fiber.per100 * 2000) / this.recipe.kcal.per100;
    const fiberRDA = 25;
    const fiberScore = (fiberPerDay / 30) * 100;
    if (this.logToReport) {
      this.report.fiber = {
        fiberPer100g: this.recipe.fiber.per100,
        fiberRDAPerServing: this.recipe.fiber.total / fiberRDA,
      };
    }
    return fiberScore;
  }

  getSaltScore() {
    const saltRDA = 5;

    // na in mg = nacl * 0.4 * 1000
    const saltPerDay =
      (this.recipe.salt.per100 * 2000) / this.recipe.kcal.per100;
    const naPerDay =
      ((this.recipe.salt.per100 * 0.4 * 2000) / this.recipe.kcal.per100) * 1000; // in mg
    const na_k =
      (this.recipe.salt.per100 * 1000 * 0.4) /
      (this.recipe.potassium_mg.per100 + 1e-6);

    // Na/K ratio: 0.5=100, 1.0=70, 1.5=40, 2.5=0, 4.0=-50
    const na_k_score = this.scaleWithPoints(na_k, [
      [0.5, 100],
      [1.0, 70],
      [1.5, 40],
      [2.5, 0],
      [4.0, -50],
    ]);

    // Total Na (mg per 2000kcal): 0mg=100, 1500mg=80, 2300mg=50, 4000mg=0, 6000mg=-50
    const total_salt_score = this.scaleWithPoints(naPerDay, [
      [0, 100],
      [1500, 80],
      [2300, 50],
      [4000, 0],
      [6000, -50],
    ]);

    if (this.logToReport) {
      this.report.salt = {
        saltPer100g: this.recipe.salt.per100,
        saltRDAPerServing: this.recipe.salt.total / saltRDA,
        na_k_ratio: na_k,
      };
    }

    return 0.7 * na_k_score + 0.3 * total_salt_score;
  }

  getSugarScore() {
    const sugarPerDay =
      (this.recipe.sugar.per100 * 2000) / this.recipe.kcal.per100;
    const score = 100 - (sugarPerDay * 5) / 6;

    if (this.logToReport) {
      let percentContributedFromNaturalScources = 0;
      if (this.recipe.sugar.contributors) {
        for (const contributor of this.recipe.sugar.contributors) {
          if (contributor?.processingLevel ?? 10 <= 2) {
            percentContributedFromNaturalScources += contributor.value;
          }
        }
      }
      const percentOfKcal =
        (this.recipe.sugar.per100 * 4) / (this.recipe.kcal.per100 + 1e-6);
      this.report.sugar = {
        totalSugarPer100: this.recipe.sugar.per100,
        percentContributedFromNaturalScources,
        percentOfKcal,
        score,
      };
    }
    return score;
  }

  getFatProfileScore() {
    if (this.recipe.fat.per100 == 0) {
      if (this.logToReport) {
        this.report.fatProfile = {
          saturated_score: 50,
          omega3_score: 50,
          omega6_score: 50,
          mufa_score: 50,
          ratio_score: 50,
          trans_score: 0,
          final_score: 50,
        };
      }
      return 50;
    }

    // Calculate fat per 2000kcal for weighting
    const fatPer2000kcal =
      (this.recipe.fat.per100 * 2000) / this.recipe.kcal.per100;

    // Calculate omega-3 per 2000kcal (in grams)
    const o3Per2000kcal =
      (this.recipe.omega3_total_mg.per100 * 2000) /
      this.recipe.kcal.per100 /
      1000;
    // Linear: 0g=30, 1.6g=70, 3.2g=100, 6.4g=170 (uncapped)
    // Slope from 1.6 onwards: (170-70)/(6.4-1.6) = 100/4.8 ≈ 20.83 per gram
    let o3_score;
    if (o3Per2000kcal <= 1.6) {
      o3_score = 30 + (o3Per2000kcal / 1.6) * 40; // 0→30, 1.6→70
    } else {
      o3_score = 70 + (o3Per2000kcal - 1.6) * (100 / 1.6); // Linear from 1.6g onwards
    }

    // Calculate omega-6 per 2000kcal (in grams)
    const o6Per2000kcal =
      (this.recipe.omega6_total_mg.per100 * 2000) /
      this.recipe.kcal.per100 /
      1000;
    // Anchors: 0g=40, 12g=100, 20g=80, 35g=40
    const o6_score = this.scaleWithPoints(o6Per2000kcal, [
      [0, 40],
      [12, 100],
      [20, 80],
      [35, 40],
    ]);

    // O3/O6 ratio: 1:1=100, 1:2=90, 1:4=70, 1:8=40, 1:15=10 (uncapped upward)
    const o3_o6_ratio = o3Per2000kcal / (o6Per2000kcal + 1e-10);
    let o_ratio_score;
    if (o3_o6_ratio >= 1.0) {
      // Linear beyond 1:1, uncapped
      o_ratio_score = 100 + (o3_o6_ratio - 1.0) * 100; // 1:1=100, 2:1=200, etc.
    } else {
      // Below 1:1, use points
      o_ratio_score = this.scaleWithPoints(o3_o6_ratio, [
        [1 / 15, 10],
        [1 / 8, 40],
        [1 / 4, 70],
        [1 / 2, 90],
        [1 / 1, 100],
      ]);
    }

    // Sat fat as %E: 0%=70, 5%=80, 10%=50, 15%=20, 20%=0 (uncapped downward)
    const sfat_pct_e =
      ((this.recipe.saturated_fat.per100 * 9) /
        (this.recipe.kcal.per100 + 1e-6)) *
      100;
    let sfat_score;
    if (sfat_pct_e <= 20) {
      sfat_score = this.scaleWithPoints(sfat_pct_e, [
        [0, 70],
        [5, 80],
        [10, 50],
        [15, 20],
        [20, 0],
      ]);
    } else {
      // Linear decline beyond 20%: slope = -20/5 = -4 per %
      sfat_score = 0 - (sfat_pct_e - 20) * 4; // uncapped downward
    }

    // Trans fat as %E: 0%=100, 0.5%=60, 1%=0, 2%=-100 (linear, uncapped)
    const trans_pct_e =
      (((this.recipe.trans_fats_mg.per100 / 1000) * 9) /
        (this.recipe.kcal.per100 + 1e-6)) *
      100;
    // Linear: slope = (0-100)/(1-0) = -100 per %E
    const trans_score = 100 - trans_pct_e * 100;

    // MUFA as %E: 5%=60, 15%=100, 25%=95, 35%=80
    const mufa_pct_e =
      (((this.recipe.mufas_total_mg.per100 / 1000) * 9) /
        (this.recipe.kcal.per100 + 1e-6)) *
      100;
    const mufa_score = this.scaleWithPoints(mufa_pct_e, [
      [5, 60],
      [15, 100],
      [25, 95],
      [35, 80],
    ]);

    // Composite score - adjust weights as needed
    let total =
      0.3 * o3_score +
      0.2 * o6_score +
      0.3 * o_ratio_score +
      0.3 * sfat_score +
      0.2 * mufa_score +
      0.5 * trans_score -
      50; // Adjusted baseline

    const totalScore = total;

    // Weight by total fat amount per 2000kcal: 0g→minimal, 65g→full, 130g→1.5x
    const fatWeight = Math.min(1.5, fatPer2000kcal / 65);
    const counterWeight = 1 - Math.min(1, fatWeight);
    const compoundScore =
      counterWeight * 50 + Math.min(1, fatWeight) * totalScore;

    if (this.logToReport) {
      this.report.fatProfile = {
        saturated_score: Math.round(sfat_score),
        omega3_score: Math.round(o3_score),
        omega6_score: Math.round(o6_score),
        mufa_score: Math.round(mufa_score),
        ratio_score: Math.round(o_ratio_score),
        trans_score: Math.round(trans_score),
        final_score: Math.round(compoundScore),
        saturated_fat_per_fat:
          this.recipe.saturated_fat.per100 / this.recipe.fat.per100,
        omega3_per_fat:
          this.recipe.omega3_total_mg.per100 / (this.recipe.fat.per100 * 1000),
        omega6_per_fat:
          this.recipe.omega6_total_mg.per100 / (this.recipe.fat.per100 * 1000),
        mufa_per_fat:
          this.recipe.mufas_total_mg.per100 / (this.recipe.fat.per100 * 1000),
        omega_ratio:
          this.recipe.omega3_total_mg.per100 /
          (this.recipe.omega6_total_mg.per100 + 1e-10),
        trans: this.recipe.trans_fats_mg.per100,
      };
    }

    return compoundScore;
  }

  getED() {
    // Satiety/Energy Density score
    // Anchors (kcal per 100g): 0kcal=120, 100kcal=100, 200kcal=70, 400kcal=30, 600kcal=0, 800kcal=-30
    return this.scaleWithPoints(this.recipe.kcal.per100, [
      [0, 120],
      [100, 100],
      [200, 70],
      [400, 30],
      [600, 0],
      [800, -30],
    ]);
  }

  getProtectiveCompoundScore() {
    const polyphenols = this.recipe.polyphenols.per100;
    const carotenoids = this.recipe.carotenoids.per100;
    const glucosinolates = this.recipe.glucosinolates.per100;

    // Composite score (0-10 scale), weighted
    const compositeScore =
      0.5 * polyphenols + 0.3 * carotenoids + 0.2 * glucosinolates;

    // Per-kcal weighting: scale up for low-calorie foods
    const kcalFactor = 100 / (this.recipe.kcal.per100 + 1e-6);
    const weightedComposite = compositeScore * Math.sqrt(kcalFactor); // sqrt to moderate the effect

    // Anchors: 0=0, 3=50, 5=80, 7=100, 9=130, 10=150
    const score = this.scaleWithPoints(weightedComposite, [
      [0, 0],
      [3, 50],
      [5, 80],
      [7, 100],
      [9, 130],
      [10, 150],
    ]);

    if (this.logToReport) {
      this.report.protectiveCompounds = {
        polyphenols: Math.round(polyphenols),
        carotenoids: Math.round(carotenoids),
        glucosinolates: Math.round(glucosinolates),
        total_score: Math.round(score),
      };
    }

    return score;
  }

  getProteinQuantityScore() {
    // Anchors: 0g=0, 50g=60, 140g=100, 300g=200
    return this.scaleWithPoints(
      (this.recipe.protein.per100 * 2000) / this.recipe.kcal.per100,
      [
        [0, 0],
        [50, 60],
        [140, 100],
        [300, 200],
      ]
    );
  }

  getProteinQualityScore() {
    const protein = this.recipe.protein.per100;
    if (protein <= 0) return 0;

    const ref = {
      Histidine: 15,
      Isoleucine: 30,
      Leucine: 59,
      Lysine: 45,
      SAA: 22,
      AAA: 38,
      Threonine: 23,
      Tryptophan: 6,
      Valine: 39,
    };

    const actual = {
      Histidine: this.recipe.histidine_mg.per100,
      Isoleucine: this.recipe.isoleucine_mg.per100,
      Leucine: this.recipe.leucine_mg.per100,
      Lysine: this.recipe.lysine_mg.per100,
      SAA: this.recipe.methionine_mg.per100 + this.recipe.cysteine_mg.per100,
      AAA: this.recipe.phenylalanine_mg.per100 + this.recipe.tyrosine_mg.per100,
      Threonine: this.recipe.threonine_mg.per100,
      Tryptophan: this.recipe.tryptophan_mg.per100,
      Valine: this.recipe.valine_mg.per100,
    };

    const ratios = Object.keys(ref).map((aa) => ({
      aa,
      ratio:
        actual[aa as keyof typeof actual] /
        this.recipe.protein.per100 /
        ref[aa as keyof typeof ref],
    }));

    const limitingAA = ratios.reduce((min, current) =>
      current.ratio < min.ratio ? current : min
    );

    this.report.protein.limitingAA = limitingAA.aa;
    this.report.protein.limitingAA_ratio = limitingAA.ratio;

    return this.scaleWithPoints(limitingAA.ratio, [
      [0, 0],
      [0.5, 30],
      [1, 100],
      [1.5, 120],
      [2, 130],
    ]);
  }

  getProteinScoreOvr() {
    this.report.protein = {};
    const quality = this.getProteinQualityScore();
    const quantity = this.getProteinQuantityScore();
    const ovr = (quality * quantity) / 100;
    if (this.logToReport) {
      this.report.protein = {
        ...this.report.protein,
        quality_score: (Math.round(quality) * 10) / 13,
        quantity_score: Math.round(quantity),
        total_protein_per_100g:
          Math.round(this.recipe.protein.per100 * 100) / 100,
        total_protein_per_serving: this.recipe.protein.total,
        protein_kcal_ratio:
          (this.recipe.protein.per100 * 4) / (this.recipe.kcal.per100 + 1e-6),
        overall_score: Math.round(ovr),
      };
    }

    return ovr;
  }

  getPLScore() {
    if (this.isFood) {
      const final_score = 100 - (this.recipe.nova.per100 - 1) * 30;
      if (this.logToReport) {
        this.report.processingLevel = {
          nova: this.recipe.nova.per100,
          final_score,
        };
      }
      return final_score;
    }
    let whole_food_count = 0;
    let ultra_processed_count = 0;
    for (const ingredient of this.recipe.fullIngredients) {
      if (ingredient.nova == 1) {
        whole_food_count++;
      } else if (ingredient.nova == 4) {
        ultra_processed_count++;
      }
    }

    const whole_food_percentage =
      whole_food_count / this.recipe.fullIngredients.length;
    const ultra_processed_percentage =
      ultra_processed_count / this.recipe.fullIngredients.length;

    const processing_level_score = 100 - (this.recipe.nova.per100 - 1) * 30;

    const whole_food_score = whole_food_percentage * 100;

    const ultra_processed_score = (1 - ultra_processed_percentage * 1.5) * 100;

    const final_score =
      processing_level_score * 0.8 +
      whole_food_score * 0.1 +
      ultra_processed_score * 0.1;
    if (this.logToReport) {
      this.report.processingLevel = {
        processing_level_score,
        whole_food_percentage,
        ultra_processed_count,
        final_score,
      };
    }
    return final_score;
  }

  getHIDX(
    satiety: number,
    protein: number,
    fiber: number,
    sugar: number,
    fat_profile: number,
    salt: number,
    mnidx: number,
    pl: number,
    protective_compound_score: number
  ) {
    const hidx =
      0.18 * pl +
      0.15 * fiber +
      0.12 * fat_profile +
      0.12 * mnidx +
      0.12 * sugar +
      0.12 * salt +
      0.1 * satiety +
      0.08 * protein +
      0.05 * protective_compound_score;

    const MIN = 25;
    const MAX = 83;
    const scaled = ((hidx - MIN) * 100) / (MAX - MIN);
    return scaled;
  }

  // Helper function to analyze processing effects for an ingredient
  analyzeProcessingEffects(
    ingredient: FullIngredient,
    recipePer100: Record<cumulativeKeys, number>
  ) {
    const effects: any = {
      ingredient: ingredient.name,
      thermal: [],
      medium: [],
      mechanical: [],
      synergies: [],
    };

    // For each nutrient with an alpha function, calculate effect
    for (const [nutrientKey, alphaFunction] of Object.entries(alphaFunctions)) {
      const baseAlpha = callAlphaFunction(
        alphaFunction,
        recipePer100,
        null,
        null,
        null
      );
      const actualAlpha = callAlphaFunction(
        alphaFunction,
        recipePer100,
        ingredient.thermal_intensity,
        ingredient.heat_medium,
        ingredient.mechanical_disruption
      );

      // Calculate individual effects
      const thermalOnlyAlpha = callAlphaFunction(
        alphaFunction,
        recipePer100,
        ingredient.thermal_intensity,
        null,
        null
      );
      const mediumOnlyAlpha = callAlphaFunction(
        alphaFunction,
        recipePer100,
        null,
        ingredient.heat_medium,
        null
      );
      const mechanicalOnlyAlpha = callAlphaFunction(
        alphaFunction,
        recipePer100,
        null,
        null,
        ingredient.mechanical_disruption
      );

      // Calculate percentage changes
      const thermalEffect = (thermalOnlyAlpha - baseAlpha) / baseAlpha;
      const mediumEffect = (mediumOnlyAlpha - baseAlpha) / baseAlpha;
      const mechanicalEffect = (mechanicalOnlyAlpha - baseAlpha) / baseAlpha;

      // Store significant effects
      if (Math.abs(thermalEffect) > this.MOVER_THRESHOLD) {
        effects.thermal.push({
          nutrient: nutrientKey,
          displayName:
            this.nutrientDisplayNames[
              nutrientKey as keyof typeof this.nutrientDisplayNames
            ] || nutrientKey,
          effect: thermalEffect,
          effectString: Math.round(thermalEffect * 100) + '%',
          direction: thermalEffect > 0 ? 'up' : 'down',
          intensity: this.getEffectIntensity(Math.abs(thermalEffect)),
        });
      }

      if (Math.abs(mediumEffect) > this.MOVER_THRESHOLD) {
        effects.medium.push({
          nutrient: nutrientKey,
          displayName:
            this.nutrientDisplayNames[
              nutrientKey as keyof typeof this.nutrientDisplayNames
            ] || nutrientKey,
          effect: mediumEffect,
          effectString: Math.round(mediumEffect * 100) + '%',
          direction: mediumEffect > 0 ? 'up' : 'down',
          intensity: this.getEffectIntensity(Math.abs(mediumEffect)),
        });
      }

      if (Math.abs(mechanicalEffect) > this.MOVER_THRESHOLD) {
        effects.mechanical.push({
          nutrient: nutrientKey,
          displayName:
            this.nutrientDisplayNames[
              nutrientKey as keyof typeof this.nutrientDisplayNames
            ] || nutrientKey,
          effect: mechanicalEffect,
          effectString: Math.round(mechanicalEffect * 100) + '%',
          direction: mechanicalEffect > 0 ? 'up' : 'down',
          intensity: this.getEffectIntensity(Math.abs(mechanicalEffect)),
        });
      }
    }

    // Sort by effect magnitude and limit
    effects.thermal.sort(
      (a: any, b: any) => Math.abs(b.effect) - Math.abs(a.effect)
    );
    effects.medium.sort(
      (a: any, b: any) => Math.abs(b.effect) - Math.abs(a.effect)
    );
    effects.mechanical.sort(
      (a: any, b: any) => Math.abs(b.effect) - Math.abs(a.effect)
    );

    effects.thermal = effects.thermal.slice(0, this.MOVER_DISPLAY_LIMIT);
    effects.medium = effects.medium.slice(0, this.MOVER_DISPLAY_LIMIT);
    effects.mechanical = effects.mechanical.slice(0, this.MOVER_DISPLAY_LIMIT);

    return effects;
  }

  getEffectIntensity(magnitude: number) {
    if (magnitude > 0.5) return '↑↑↑';
    if (magnitude > 0.25) return '↑↑';
    if (magnitude > 0.1) return '↑';
    return '';
  }

  formatProcessingDescription(ingredient: FullIngredient, effects: any) {
    const parts: string[] = [];

    // Add thermal effects
    if (effects.thermal.length > 0) {
      const thermalDesc = ingredient.thermal_description;
      effects.thermal.forEach((effect: any) => {
        const arrows =
          effect.direction === 'down'
            ? effect.intensity.replace(/↑/g, '↓')
            : effect.intensity;
        parts.push(`${thermalDesc} ${arrows} ${effect.displayName}`);
      });
    }

    // Add medium synergy effects
    if (effects.medium.length > 0 && ingredient.heat_medium) {
      effects.medium.forEach((effect: any) => {
        const arrows =
          effect.direction === 'down'
            ? effect.intensity.replace(/↑/g, '↓')
            : effect.intensity;
        parts.push(
          `${ingredient.heat_medium} medium ${arrows} ${effect.displayName}`
        );
      });
    }

    // Add mechanical effects
    if (effects.mechanical.length > 0) {
      const mechDesc = ingredient.mechanical_description;
      effects.mechanical.forEach((effect: any) => {
        const arrows =
          effect.direction === 'down'
            ? effect.intensity.replace(/↑/g, '↓')
            : effect.intensity;
        parts.push(`${mechDesc} ${arrows} ${effect.displayName}`);
      });
    }

    return parts.join(', ');
  }

  generateReport() {
    // Overall grade and details
    this.report.overall = {
      ...this.recipe.scores,
      nova: this.recipe.nova.total,
      grade: getGrade(this.recipe.scores.hidx, 'ovr'),
      total_weight: Math.round(this.recipe.total_weight),
      kcal_per_100g: Math.round(this.recipe.kcal.per100),
      serving_size: this.recipe.serves,
    };

    if (!this.isFood) {
      // Process ingredient-level analysis
      this.report.processingEffects = [];

      for (const ingredientData of this.report.ingredientNutrients) {
        const ingredient = this.recipe.fullIngredients.find(
          (ing) => ing.name === ingredientData.name
        );
        if (!ingredient) continue;

        const recipePer100: any = {};
        for (const field of this.cumulativeFields) {
          recipePer100[field] = this.recipe[field].per100;
        }
        const effects = this.analyzeProcessingEffects(ingredient, recipePer100);
        const description = this.formatProcessingDescription(
          ingredient,
          effects
        );

        if (description) {
          this.report.processingEffects.push({
            ingredient: ingredient.name,
            weight: Math.round(ingredientData.weight),
            description,
            effects,
          });
        }
      }
    }
    this.report.humanReadable = getReportHumanReadable(
      this.report,
      this.getRecipeRow() as Recipe,
      this.isFood
    );
    this.recipe.report = this.getTrimmedReport();
    this.recipe.fullReport = this.report;
  }

  getTrimmedReport() {
    const trimmedMicronutrients = this.report.micronutrients.details.map(
      (nutrient: any) => ({
        name: nutrient.name,
        displayName: nutrient.displayName,
        rdaPerServing: nutrient.rdaPerServing,
      })
    );
    return {
      overall: this.report.overall,
      humanReadable: this.report.humanReadable,
      micronutrients: {
        details: trimmedMicronutrients,
      },
    };
  }
}
