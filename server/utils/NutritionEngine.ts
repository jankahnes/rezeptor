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

const micronutrientWeights = [
  { name: 'iron_mg', weight: 1.5, rda: 13.0 },
  { name: 'magnesium_mg', weight: 1.2, rda: 400.0 },
  { name: 'zinc_mg', weight: 1.0, rda: 10.0 },
  { name: 'calcium_mg', weight: 1.2, rda: 1000.0 },
  { name: 'potassium_mg', weight: 1.3, rda: 4700.0 },
  { name: 'selenium_ug', weight: 0.5, rda: 55 },
  { name: 'iodine_ug', weight: 1, rda: 150 },
  { name: 'copper_mg', weight: 0.3, rda: 0.9 },
  { name: 'manganese_mg', weight: 0.2, rda: 2.3 },
  { name: 'vitamin_a_ug_rae', weight: 1, rda: 800 },
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

export default class NutritionEngine {
  recipe!: ComputedRecipe;
  food!: Food;

  considerProcessing = false;
  useGpt = false;
  logToReport = false;
  nutritionLabelOnly = false;
  disableSatiety = false;

  gptInformation: GptInformation = {
    tags: [],
    processing: [],
    ingredients_not_fully_consumed: [],
  };

  targetSalt = 0;
  isFood = false;
  report: any = {};
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

  constructor(
    useGpt = false,
    logToReport = false,
    considerProcessing = false,
    nutritionLabelOnly = false,
    disableSatiety = false
  ) {
    this.useGpt = useGpt;
    this.logToReport = logToReport;
    this.considerProcessing = considerProcessing;
    this.nutritionLabelOnly = nutritionLabelOnly;
    this.disableSatiety = disableSatiety;
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
    if (!recipe.serves) {
      console.error('WARNING: Recipe has no serves, setting to 1');
      recipe.serves = 1;
    }
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

    this.recipe.kcal.total = Math.round(this.recipe.kcal.total);
    this.recipe.total_weight = Math.round(this.recipe.total_weight);

    if (this.nutritionLabelOnly) {
      return;
    }

    console.log('🔍 Starting scoring');
    const scores = await this.getScoring();
    this.recipe.scores = scores;
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
    console.log('🔍 Scoring done');
  }

  async computeFood(food: Food) {
    this.isFood = true;
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
    const ingredients = this.recipe.fullIngredients.filter(
      (ingredient) => ingredient.amount != null && !isNaN(ingredient.amount)
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
      if (!ingredient.utility) {
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

    // Calculate per-100g intrinsic salt to compare with target
    const intrinsicSaltPer100g =
      (this.recipe.salt.total / this.recipe.total_weight) * 100;

    // If intrinsic salt is below target, add salt to reach target
    if (intrinsicSaltPer100g < this.targetSalt) {
      const targetSaltTotal =
        (this.targetSalt * this.recipe.total_weight) / 100;
      this.recipe.added_salt =
        targetSaltTotal - this.recipe.salt.totalBeforeAlpha;
      this.recipe.salt.totalBeforeAlpha = targetSaltTotal;
      this.recipe.salt.per100 =
        (targetSaltTotal / this.recipe.total_weight) * 100;
      this.recipe.salt.total = targetSaltTotal;
    } else {
      this.recipe.added_salt = 0;
    }

    // sanity check for unusually high serving sizes
    // proposed: recursive approach to increase serving size until its reasonable
    if (
      !this.nutritionLabelOnly &&
      this.recipe.kcal.total > this.UNUSUAL_KCAL_THRESHOLD
    ) {
      this.UNUSUAL_KCAL_THRESHOLD = 800;
      const probableYieldSizes = [2, 3, 4, 5, 6, 8, 10, 12, 15, 18, 24, 32, 64];
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
    const sidx = this.disableSatiety ? null : await this.getSIDX(water);
    const satiety = this.disableSatiety
      ? Math.min(ed, 80)
      : 0.5 * ed + 0.5 * sidx!;
    const mnidx = this.getMNIDX();
    const fiber_score = this.getFiberScore();
    const protein_score = this.getProteinScoreOvr();
    const salt_score = this.getSaltScore();
    const sugar_score = this.getSugarScore();
    const fat_profile_score = this.getFatProfileScore();
    const protective_score = this.getProtectiveCompoundScore();
    const processing_level_score = this.getPLScore();
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
      sidx: Math.round(sidx ?? 50),
      fiber_score: Math.max(0, Math.min(150, Math.round(fiber_score))),
      protein_score: Math.min(110, Math.round(protein_score)),
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

  getMNIDX() {
    if (this.recipe.kcal.per100 === 0) {
      if (this.logToReport) {
        this.report.micronutrients = {
          total_score: 0,
          details: [],
        };
      }
      return 0;
    }

    // Direct Positive Linear Correlation for each nutrient
    // Per kcal, extrapolated to 2000kcal
    // Anchors (per nutrient, as %RDA per 2000kcal): 0%=0, 50%=50, 100%=100, 200%=200 (linear, uncapped)
    // totalScore = sum(all weightedScores) / sum(all weights)

    let totalWeightedScore = 0;
    let totalWeight = 0;
    const micronutrientDetails: {
      name: string;
      displayName: string;
      value: number;
      nutrientPer2000kcal: number;
      percentRDA: number;
      nutrientScore: number;
      weightedScore: number;
      rdaPer100: number;
      rdaPerServing: number;
    }[] = [];

    for (const nutrient of micronutrientWeights) {
      const name = nutrient.name as cumulativeKeys;
      const weight = nutrient.weight;
      const rda = nutrient.rda;

      const rawValue = this.recipe[name].per100 || 0;

      // nutrientPer2000kcal = (nutrient_per100g / kcal_per100g) * 2000
      const nutrientPer2000kcal = (rawValue / this.recipe.kcal.per100) * 2000;

      // percentRDA = (nutrientPer2000kcal / rda) * 100
      const percentRDA = (nutrientPer2000kcal / rda) * 100;

      // nutrientScore = percentRDA (linear, uncapped)
      const nutrientScore = percentRDA;

      // weightedScore = nutrientScore * weight
      const weightedScore = nutrientScore * weight;

      totalWeightedScore += weightedScore;
      totalWeight += weight;

      if (this.logToReport && rawValue > 0) {
        micronutrientDetails.push({
          name,
          displayName:
            this.nutrientDisplayNames[
              name as keyof typeof this.nutrientDisplayNames
            ] || name,
          value: Math.round(rawValue * 100) / 100,
          nutrientPer2000kcal: Math.round(nutrientPer2000kcal * 100) / 100,
          percentRDA: Math.round(percentRDA * 100) / 100,
          rdaPer100: Math.round((rawValue * 100) / rda),
          rdaPerServing: Math.round(
            (rawValue * this.recipe.total_weight) / rda
          ),
          nutrientScore: Math.round(nutrientScore * 100) / 100,
          weightedScore: Math.round(weightedScore * 100) / 100,
        });
      }
    }

    // totalScore = sum(all weightedScores) / sum(all weights)
    const totalScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

    if (this.logToReport) {
      micronutrientDetails.sort((a, b) => b.weightedScore - a.weightedScore);
      this.report.micronutrients = {
        details: micronutrientDetails,
      };
    }

    return Math.min(200, totalScore * 0.5);
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
    if (this.recipe.kcal.per100 === 0) {
      if (this.logToReport) {
        this.report.fiber = {
          fiberPer100g: this.recipe.fiber.per100,
          fiberPer2000kcal: 0,
          score: 0,
        };
      }
      return 0;
    }

    // Per kcal, extrapolated to 2000kcal
    // Unbounded Anchors (per 2000kcal): (0g=0, 50g=100)
    // score = 2 * fiberPer2000kcal
    const fiberPer2000kcal =
      (this.recipe.fiber.per100 / this.recipe.kcal.per100) * 2000;
    const score = 2 * fiberPer2000kcal;

    if (this.logToReport) {
      this.report.fiber = {
        fiberPer100g: this.recipe.fiber.per100,
        fiberTotal: this.recipe.fiber.total,
        fiberPer2000kcal,
        fiberRDAPer2000kcal: fiberPer2000kcal / 30,
      };
    }
    return Math.min(200, score);
  }

  getSaltScore() {
    // Na/K ratio only - Na/K ratio is stronger predictor than absolute sodium
    // Per kcal scaling for both Na and K
    // na in mg = nacl * 0.4 * 1000
    const na_mg_per100g = this.recipe.salt.per100 * 0.4 * 1000;
    const k_mg_per100g = this.recipe.potassium_mg.per100 || 0;

    const totalElectrolytesPer100g = na_mg_per100g + k_mg_per100g;

    const naPer1000kcal =
      (na_mg_per100g / (this.recipe.kcal.per100 + 1e-6)) * 1000;
    const kPer1000kcal =
      (k_mg_per100g / (this.recipe.kcal.per100 + 1e-6)) * 1000;

    // Avoid division by zero
    const naKRatio = kPer1000kcal > 0 ? naPer1000kcal / kPer1000kcal : 100;

    // Bounded Linear Anchors for Na/K ratio: 0.5=100 (optimal), 2.0=50 (on track), 3.5=0 (very bad)
    // rawScore = 100 - (100/3) * (naKRatio - 0.5)
    const rawScore = 100 - (100 / 3) * (naKRatio - 0.5);

    // Relevance weighting to avoid low-absolute-value paradox
    // weight = min(1, totalElectrolytes_per_1000kcal / 2000)
    const totalElectrolytesPer1000kcal = naPer1000kcal + kPer1000kcal;

    const weight = Math.min(1, totalElectrolytesPer1000kcal / 2000);

    // Foods with negligible electrolytes drift toward neutral (50), full weight at ~2000mg+ combined
    const score = (1 - weight) * 50 + weight * rawScore;

    // Bounds at -50, 150
    const clampedScore = Math.max(-50, Math.min(150, score));

    if (this.logToReport) {
      this.report.salt = {
        saltPer100g: this.recipe.salt.per100,
        naPer1000kcal,
        kPer1000kcal,
        naKRatio,
        saltRDAPerServing: this.recipe.salt.total / 5,
        totalElectrolytesPer1000kcal,
        totalElectrolytesPer100g,
      };
    }

    return clampedScore;
  }

  getSugarScore() {
    if (this.recipe.kcal.per100 === 0) {
      if (this.logToReport) {
        this.report.sugar = {
          totalSugarPer100: this.recipe.sugar.per100,
          sugarPer2000kcal: 0,
          score: 100,
        };
      }
      return 100;
    }

    // Direct Linear Uncapped Negative Correlation
    // Per kcal, extrapolated to 2000kcal
    // Unbounded Anchors (per 2000kcal): (0g=100, 90g=0)
    // score = 100 - (10/9) * sugarPer2000kcal
    const sugarPer2000kcal =
      (this.recipe.sugar.per100 / this.recipe.kcal.per100) * 2000;
    const score = 100 - (10 / 9) * sugarPer2000kcal;

    if (this.logToReport) {
      let percentContributedFromNaturalSources = 0;
      if (this.recipe.sugar.contributors) {
        for (const contributor of this.recipe.sugar.contributors) {
          if (contributor?.processingLevel ?? 10 <= 2) {
            percentContributedFromNaturalSources += contributor.value;
          }
        }
      }
      const percentOfKcal =
        (this.recipe.sugar.per100 * 4) / (this.recipe.kcal.per100 + 1e-6);
      this.report.sugar = {
        totalSugarPer100: this.recipe.sugar.per100,
        sugarPer2000kcal,
        percentContributedFromNaturalSources,
        percentOfKcal,
      };
    }
    return Math.max(-100, score);
  }

  getFatProfileScore() {
    if (this.recipe.kcal.per100 === 0 || this.recipe.fat.per100 === 0) {
      if (this.logToReport) {
        this.report.fatProfile = {
          saturated_score: 50,
          omega3_score: 50,
          omega6_score: 50,
          mufa_score: 50,
          trans_penalty: 1.0,
          base_score: 50,
          raw_score: 50,
          weight: 0,
          final_score: 50,
        };
      }
      return 50;
    }

    // Composite score: omega-3 (35%), saturated fat (35%), MUFA (20%), omega-6 (10%), trans fat (penalty multiplier)
    // All fatty acids scored as % of total fat (quality metric)
    // Relevance weighting handles absolute fat amount

    const totalFatPer100g = this.recipe.fat.per100;

    // O3 (% of total fat, 35% weight): 0%=30, 2.5%=70, 5%=100 (linear, unbounded)
    // o3Percent = (omega3_per100g / totalFat_per100g) * 100
    // o3Score = 30 + 14 * o3Percent
    const omega3_per100g = (this.recipe.omega3_total_mg.per100 || 0) / 1000; // Convert mg to g
    const o3Percent = (omega3_per100g / totalFatPer100g) * 100;
    const o3Score = 30 + 14 * o3Percent;

    // Saturated Fat (% of total fat, 35% weight): 0%=70, 33%=50, 67%=0 (linear, unbounded negative)
    // satFatPercent = (satFat_per100g / totalFat_per100g) * 100
    // satFatScore = 70 - (70/67) * satFatPercent
    const satFatPercent =
      (this.recipe.saturated_fat.per100 / totalFatPer100g) * 100;
    const satFatScore = 70 - (70 / 67) * satFatPercent;

    // MUFA (% of total fat, 20% weight): 0%=40, 60%=100 (linear, bounded at 100)
    // mufaPercent = (mufa_per100g / totalFat_per100g) * 100
    // mufaScore = min(100, 40 + 1 * mufaPercent)
    const mufa_per100g = (this.recipe.mufas_total_mg.per100 || 0) / 1000; // Convert mg to g
    const mufaPercent = (mufa_per100g / totalFatPer100g) * 100;
    const mufaScore = Math.min(100, 40 + 1 * mufaPercent);

    // O6 (% of total fat, 10% weight): 0%=45, 40%=60 (linear, weak positive, bounded 30-70)
    // o6Percent = (omega6_per100g / totalFat_per100g) * 100
    // o6Score = clamp(45 + 0.375 * o6Percent, 30, 70)
    const omega6_per100g = (this.recipe.omega6_total_mg.per100 || 0) / 1000; // Convert mg to g
    const o6Percent = (omega6_per100g / totalFatPer100g) * 100;
    const o6Score = Math.max(30, Math.min(70, 45 + 0.375 * o6Percent));

    // Trans Fat (penalty multiplier, % of total fat): 0%=1.0x, 2%=0.75x, 4%=0.5x, 8%=0.25x
    // transFatPercent = (transFat_per100g / totalFat_per100g) * 100
    // transPenalty = max(0.25, 1 - transFatPercent * 12.5)
    const transFat_per100g = (this.recipe.trans_fats_mg.per100 || 0) / 1000; // Convert mg to g
    const transFatPercent = (transFat_per100g / totalFatPer100g) * 100;
    const transPenalty = Math.max(0.25, 1 - transFatPercent * 5);

    // baseScore = 0.35 * satFatScore + 0.35 * o3Score + 0.20 * mufaScore + 0.10 * o6Score
    // rawScore = baseScore * transPenalty
    const baseScore =
      0.4 * satFatScore + 0.4 * o3Score + 0.25 * mufaScore + 0.1 * o6Score;
    const rawScore = baseScore; // * transPenalty;

    // Relevance weighting to avoid low-fat paradox
    // weight = min(1, fatPer2000kcal / 40) where fatPer2000kcal = (fat_per100g / kcal_per100g) * 2000
    // Low-fat foods drift toward neutral (50), full weight at 40g+ fat per 2000kcal
    const fatPer2000kcal =
      (this.recipe.fat.per100 / this.recipe.kcal.per100) * 2000;
    const weight = Math.min(1, fatPer2000kcal / 40);
    const score = (1 - weight) * 50 + weight * rawScore;

    // Bounds at -50, 150
    const clampedScore = Math.max(-50, Math.min(200, score));

    if (this.logToReport) {
      this.report.fatProfile = {
        fatPer2000kcal,
        totalFatPer100g,
        satFatPercent,
        o3Percent,
        o6Percent,
        mufaPercent,
        transFatPercent: 0, // not used in score
      };
    }

    return clampedScore;
  }

  getED() {
    // Anchors for ED, unbounded (kcal per 100g): 0kcal=150, 600kcal=0
    // edScore = 150 - 0.25 * kcal_per100g
    const edScore = 150 - 0.25 * this.recipe.kcal.per100;
    return edScore;
  }

  getProtectiveCompoundScore() {
    if (this.recipe.kcal.per100 === 0) {
      if (this.logToReport) {
        this.report.protectiveCompounds = {
          polyphenolsPer2000kcal: 0,
          carotenoidsPer2000kcal: 0,
          glucosinolatesPer2000kcal: 0,
          compositeValue: 0,
          total_score: 0,
        };
      }
      return 0;
    }

    // Direct Positive Uncapped Health Correlation
    // Based on database scores (0-10 scale) for: Polyphenols, Glucosinolates, Carotenoids
    // Per kcal weighting (denser compounds in low-cal foods should score higher)
    // Anchors for all, per 2000kcal: 0=0, 100=150
    // current weights: 0.5 * polyphenols + 0.3 * carotenoids + 0.2 * glucosinolates
    // score = 1.5 * compositeValue

    const polyphenols_0to10 = this.recipe.polyphenols.per100 || 0;
    const carotenoids_0to10 = this.recipe.carotenoids.per100 || 0;
    const glucosinolates_0to10 = this.recipe.glucosinolates.per100 || 0;

    // polyphenolsPer2000kcal = (polyphenols_0to10 / kcal_per100g) * 2000
    const polyphenolsPer2000kcal =
      (polyphenols_0to10 / this.recipe.kcal.per100) * 2000;

    // carotenoidsPer2000kcal = (carotenoids_0to10 / kcal_per100g) * 2000
    const carotenoidsPer2000kcal =
      (carotenoids_0to10 / this.recipe.kcal.per100) * 2000;

    // glucosinolatesPer2000kcal = (glucosinolates_0to10 / kcal_per100g) * 2000
    const glucosinolatesPer2000kcal =
      (glucosinolates_0to10 / this.recipe.kcal.per100) * 2000;

    // compositeValue = 0.5 * polyphenolsPer2000kcal + 0.3 * carotenoidsPer2000kcal + 0.2 * glucosinolatesPer2000kcal
    const compositeValue =
      0.5 * polyphenolsPer2000kcal +
      0.3 * carotenoidsPer2000kcal +
      0.2 * glucosinolatesPer2000kcal;

    // score = 1.5 * compositeValue
    const score = compositeValue + 25;

    if (this.logToReport) {
      this.report.protectiveCompounds = {
        polyphenols: Math.round(polyphenols_0to10),
        carotenoids: Math.round(carotenoids_0to10),
        glucosinolates: Math.round(glucosinolates_0to10),
        polyphenolsPer2000kcal: Math.round(polyphenolsPer2000kcal),
        carotenoidsPer2000kcal: Math.round(carotenoidsPer2000kcal),
        glucosinolatesPer2000kcal: Math.round(glucosinolatesPer2000kcal),
      };
    }

    return Math.max(0, Math.min(150, score));
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

    if (this.logToReport) {
      this.report.protein.limitingAA = limitingAA.aa;
      this.report.protein.limitingAA_ratio = limitingAA.ratio;
    }
    return this.scaleWithPoints(limitingAA.ratio, [
      [0, 0],
      [0.5, 30],
      [1, 100],
      [1.5, 120],
      [2, 130],
    ]);
  }

  getProteinScoreOvr() {
    if (this.recipe.kcal.per100 === 0) {
      if (this.logToReport) {
        this.report.protein = {
          proteinPer2000kcal: 0,
          rawScore: 0,
          qualityMultiplier: 0,
          overall_score: 0,
        };
      }
      return 0;
    }

    // Direct Positive Linear Correlation
    // Multiply by protein quality score (DIAAS/PDCAAS-based)
    // Per kcal, extrapolated to 2000kcal
    // Anchors unbounded (g per 2000kcal): 0g=0, 120g=100
    // rawScore = (100/120) * proteinPer2000kcal
    // qualityMultiplier = [DIAAS or PDCAAS score, 0-1 scale]
    // score = rawScore * qualityMultiplier

    const proteinPer2000kcal =
      (this.recipe.protein.per100 / this.recipe.kcal.per100) * 2000;
    const rawScore = (100 / 120) * proteinPer2000kcal;

    // Get quality score and normalize to 0-1 scale
    // Current quality score ranges from 0-130, where 100 = meeting reference pattern
    const qualityRaw = this.getProteinQualityScore();
    const qualityMultiplier = Math.min(1.0, qualityRaw / 100);

    const score = Math.min(200, rawScore * qualityMultiplier);

    if (this.logToReport) {
      this.report.protein = {
        ...this.report.protein,
        proteinPer2000kcal,
        proteinPer100g: this.recipe.protein.per100,
        proteinPerServing: this.recipe.protein.total,
        proteinKcalRatio:
          (this.recipe.protein.per100 * 4) / (this.recipe.kcal.per100 + 1e-6),
      };
    }

    return score;
  }

  getPLScore() {
    // NOVA map: 1->100, 2->90, 3->75, 4->15
    const novaMap = (nova: number) => {
      if (nova === 1) return 100;
      if (nova === 2) return 90;
      if (nova === 3) return 75;
      if (nova === 4) return 15;
      // Interpolate for values between integers
      if (nova < 2) return 100 - (nova - 1) * 10;
      if (nova < 3) return 90 - (nova - 2) * 15;
      if (nova < 4) return 75 - (nova - 3) * 60;
      return 15;
    };

    if (this.isFood) {
      const final_score = novaMap(this.recipe.nova.per100);
      if (this.logToReport) {
        this.report.processingLevel = {
          nova: this.recipe.nova.per100,
          final_score,
        };
      }
      return final_score;
    }

    // For recipes: calculate avgNOVA, pctUPF, maxNOVA, pctUPFCt
    // Use recipe totals which already account for yield_factor
    const totalWeight = this.recipe.total_weight;
    const totalKcal = this.recipe.kcal.total;

    let weightFromNOVA4 = 0;
    let kcalFromNOVA4 = 0;

    let weightFromNOVA1 = 0;
    let kcalFromNOVA1 = 0;

    let maxNOVA = 0;
    let upfCount = 0;
    let wholeCount = 0;

    // Calculate avgNOVA using 50:50 weight:kcal averaging
    let weightedNOVASum = 0;
    let totalWeighted = 0;
    const upfIngredients = [];
    const wholeIngredients = [];
    for (const ingredient of this.recipe.fullIngredients) {
      const unit_weight = ingredient?.countable_units?.[ingredient.unit] ?? 0;
      const originalGrams =
        convertToGrams(
          ingredient.amount,
          ingredient.unit,
          ingredient.density,
          unit_weight
        ) / this.recipe.serves;
      const consumptionFactor = ingredient.consumption_factor ?? 1;
      const consumedGrams =
        originalGrams * consumptionFactor * this.recipe.yield_factor;
      const ingredientKcal = ((ingredient.kcal || 0) * consumedGrams) / 100;

      const nova = ingredient.nova || 1;

      // Track UPF contributions
      if (nova === 4) {
        weightFromNOVA4 += consumedGrams;
        kcalFromNOVA4 += ingredientKcal;
        upfCount++;
        if (this.logToReport) {
          upfIngredients.push({ name: ingredient.name, weight: consumedGrams });
        }
      }
      if (nova === 1) {
        weightFromNOVA1 += consumedGrams;
        kcalFromNOVA1 += ingredientKcal;
        wholeCount++;
        if (this.logToReport) {
          wholeIngredients.push({
            name: ingredient.name,
            weight: consumedGrams,
          });
        }
      }
      if (nova > maxNOVA) {
        maxNOVA = nova;
      }

      // Calculate weighted NOVA contribution
      const weightContribution =
        totalWeight > 0 ? consumedGrams / totalWeight : 0;
      const kcalContribution = totalKcal > 0 ? ingredientKcal / totalKcal : 0;
      const combinedContribution =
        0.5 * weightContribution + 0.5 * kcalContribution;

      weightedNOVASum += nova * combinedContribution;
      totalWeighted += combinedContribution;
    }
    const avgNOVA = totalWeighted > 0 ? weightedNOVASum / totalWeighted : 1;

    // Calculate pctUPF: 50:50 %kcal:%weight
    const pctUPFWeight =
      totalWeight > 0 ? (weightFromNOVA4 / totalWeight) * 100 : 0;
    const pctUPFKcal = totalKcal > 0 ? (kcalFromNOVA4 / totalKcal) * 100 : 0;
    const pctUPF = 0.5 * pctUPFWeight + 0.5 * pctUPFKcal;
    const pctWholeWeight =
      totalWeight > 0 ? (weightFromNOVA1 / totalWeight) * 100 : 0;
    const pctWholeKcal = totalKcal > 0 ? (kcalFromNOVA1 / totalKcal) * 100 : 0;
    const pctWhole = 0.5 * pctWholeWeight + 0.5 * pctWholeKcal;

    // Calculate pctUPFCt: percentage of UPF ingredients by count
    const pctUPFCt =
      this.recipe.fullIngredients.length > 0
        ? (upfCount / this.recipe.fullIngredients.length) * 100
        : 0;

    // Calculate final score
    const scaledAvgNOVA = novaMap(avgNOVA);
    const scaledMaxNOVA = novaMap(maxNOVA);
    const novaScore =
      0.7 * scaledAvgNOVA + 0.3 * scaledMaxNOVA - 0.5 * pctUPF - 0.5 * pctUPFCt;

    if (this.logToReport) {
      this.report.processingLevel = {
        avgNOVA,
        maxNOVA,
        pctUPF,
        pctWhole,
        wholeCount,
        upfCount,
      };
      this.report.processingLevel.upfIngredients = upfIngredients
        .sort((a, b) => b.weight - a.weight)
        .map((ingredient) => ingredient.name)
        .slice(0, 3);
      this.report.processingLevel.wholeIngredients = wholeIngredients
        .sort((a, b) => b.weight - a.weight)
        .map((ingredient) => ingredient.name)
        .slice(0, 3);
    }
    return Math.max(0, Math.min(100, novaScore));
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
      0.17 * pl + //processing level, proxy for additives or unwanted processing side effects.
      0.15 * fiber + //direct positive impact
      0.12 * sugar + //direct negative impact
      0.12 * fat_profile + //direct impact, mixed based on fatty acid profile
      0.11 * mnidx + //direct positive impact
      0.11 * salt + //direct negative impact
      0.11 * satiety + //satiety ; proxy for overeating/obesity risk
      0.07 * protein + //direct positive impact
      0.05 * protective_compound_score; //direct positive impact
    const MIN = 10;
    const MAX = 100;
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
