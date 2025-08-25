import {
  alpha_vitaminA,
  alpha_vitaminB1,
  alpha_vitaminB2,
  alpha_vitaminB3,
  alpha_vitaminB6,
  alpha_vitaminB9,
  alpha_vitaminB12,
  alpha_vitaminC,
  alpha_vitaminD,
  alpha_vitaminE,
  alpha_vitaminK,
  alpha_iron,
  alpha_magnesium,
  alpha_zinc,
  alpha_calcium,
  alpha_potassium,
  alpha_selenium,
  alpha_iodine,
  alpha_copper,
  alpha_manganese,
  alpha_omega3,
  alpha_omega6,
  alpha_MUFA,
  alpha_EAAs_except_Lysine,
  alpha_lysine,
  alpha_glucosinolates,
  alpha_polyphenols,
  alpha_carotenoids,
  alpha_choline,
} from '~/utils/calculation/alphas';

import { predictSatiety } from '~/utils/predictSatiety';
import gptCreateRecipe from '~/utils/gpt/gptCreateRecipe';
import capitalize from '~/utils/format/capitalize';
import convertToGrams from '~/utils/format/convertToGrams';
import { getGrade } from '~/utils/constants/grades';
import getReportHumanReadable from '~/utils/format/toHumanReadable/getReportHumanReadable';
import vegetableOilData from '~/utils/constants/vegetableOil.json';


const themalGptToAlpha = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
};

const thermalGptToDB = {
  LOW: 'LOW (50C-99C)',
  MEDIUM: 'MEDIUM (100C-180C)',
  HIGH: 'HIGH (180+C)',
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

const noAlpha = (row, T, M, D) => 1;

const cumulCols = {
  kcal: noAlpha,
  protein: noAlpha,
  carbohydrates: noAlpha,
  fat: noAlpha,
  saturated_fat: noAlpha,
  sugar: noAlpha,
  fiber: noAlpha,
  price: noAlpha,
  iron_mg: alpha_iron,
  magnesium_mg: alpha_magnesium,
  zinc_mg: alpha_zinc,
  calcium_mg: alpha_calcium,
  potassium_mg: alpha_potassium,
  selenium_ug: alpha_selenium,
  iodine_ug: alpha_iodine,
  copper_mg: alpha_copper,
  manganese_mg: alpha_manganese,
  vitamin_a_ug_rae: alpha_vitaminA,
  vitamin_c_mg: alpha_vitaminC,
  vitamin_d_ug: alpha_vitaminD,
  vitamin_e_mg_alpha_te: alpha_vitaminE,
  vitamin_k_ug: alpha_vitaminK,
  thiamine_b1_mg: alpha_vitaminB1,
  riboflavin_b2_mg: alpha_vitaminB2,
  niacin_b3_mg: alpha_vitaminB3,
  vitamin_b6_mg: alpha_vitaminB6,
  folate_ug_dfe: alpha_vitaminB9,
  vitamin_b12_ug: alpha_vitaminB12,
  trans_fats_mg: noAlpha,
  mufas_total_mg: alpha_MUFA,
  choline_mg: alpha_choline,
  omega6_total_mg: alpha_omega6,
  omega3_total_mg: alpha_omega3,
  glucosinolates: alpha_glucosinolates,
  polyphenols: alpha_polyphenols,
  carotenoids: alpha_carotenoids,
  histidine_mg: alpha_EAAs_except_Lysine,
  isoleucine_mg: alpha_EAAs_except_Lysine,
  leucine_mg: alpha_EAAs_except_Lysine,
  lysine_mg: alpha_lysine,
  methionine_mg: alpha_EAAs_except_Lysine,
  cysteine_mg: alpha_EAAs_except_Lysine,
  phenylalanine_mg: alpha_EAAs_except_Lysine,
  tyrosine_mg: alpha_EAAs_except_Lysine,
  threonine_mg: alpha_EAAs_except_Lysine,
  tryptophan_mg: alpha_EAAs_except_Lysine,
  valine_mg: alpha_EAAs_except_Lysine,
  nova: noAlpha,
  sidx: noAlpha,
  mnidx: noAlpha,
  fat_profile_score: noAlpha,
  protective_score: noAlpha,
  salt: noAlpha,
};

export default class RecipeCalculator {
  recipe;
  recipeComputed;
  recipePer100;
  cumulColsComputed;
  useGpt = false;
  gptTargetSalt = 0.7;
  gptIngredients = [];
  gptHydrationIngredients = [];
  servingSize = 1;
  ingredientsFlat = [];
  logToReport = false;
  report = {};

  isFood = false;
  considerProcessing = false;
  // Constants for reporting
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

  constructor(recipe, useGpt = false, logToReport = false, isFood = false, considerProcessing = false) {
    if (!recipe) {
      return;
    }
    this.isFood = isFood;
    this.considerProcessing = considerProcessing;
    if (isFood) {
      this.recipePer100 = recipe;
      this.recipeComputed = {
        title: recipe.name,
        totalWeight: 100
      }
      return;
    }
    this.recipe = recipe;
    this.recipeComputed = {
      title: recipe?.title,
      description: recipe?.description,
      effort: recipe?.effort?.toUpperCase(),
      difficulty: recipe?.difficulty?.toUpperCase(),
      visibility: recipe?.visibility?.toUpperCase(),
      instructions: recipe?.instructions,
      collection: recipe?.collection,
      total_time_mins: recipe?.total_time_mins,
      rating: recipe?.rating
    };
    this.useGpt = useGpt;
    this.servingSize = recipe.ingredients_editable.servingSize;
    this.cumulColsComputed = {};
    this.logToReport = logToReport;
    if (this.logToReport) {
      this.initializeReport();
    }
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

  // Helper function to analyze processing effects for an ingredient
  analyzeProcessingEffects(ingredient, recipePer100) {
    const thermal = themalGptToAlpha[ingredient?.thermal_intensity] || 0;
    const medium = capitalize(ingredient?.heat_medium || 'None');
    const mechanical = ingredient?.mechanical_disruption || 0;

    const effects = {
      ingredient: ingredient.name,
      thermal: [],
      medium: [],
      mechanical: [],
      synergies: [],
    };

    // For each nutrient with an alpha function, calculate effect
    for (const [nutrientKey, alphaFunction] of Object.entries(cumulCols)) {
      if (alphaFunction === noAlpha) continue;

      // Calculate alphas with different processing levels
      const baseAlpha = alphaFunction(recipePer100, 0, 'None', 0);
      const actualAlpha = alphaFunction(
        recipePer100,
        thermal,
        medium,
        mechanical
      );

      // Calculate individual effects
      const thermalOnlyAlpha = alphaFunction(recipePer100, thermal, 'None', 0);
      const mediumOnlyAlpha = alphaFunction(recipePer100, 0, medium, 0);
      const mechanicalOnlyAlpha = alphaFunction(
        recipePer100,
        0,
        'None',
        mechanical
      );

      // Calculate percentage changes
      const thermalEffect = (thermalOnlyAlpha - baseAlpha) / baseAlpha;
      const mediumEffect = (mediumOnlyAlpha - baseAlpha) / baseAlpha;
      const mechanicalEffect = (mechanicalOnlyAlpha - baseAlpha) / baseAlpha;

      // Store significant effects
      if (Math.abs(thermalEffect) > this.MOVER_THRESHOLD) {
        effects.thermal.push({
          nutrient: nutrientKey,
          displayName: this.nutrientDisplayNames[nutrientKey] || nutrientKey,
          effect: thermalEffect,
          direction: thermalEffect > 0 ? 'up' : 'down',
          intensity: this.getEffectIntensity(Math.abs(thermalEffect)),
        });
      }

      if (Math.abs(mediumEffect) > this.MOVER_THRESHOLD) {
        effects.medium.push({
          nutrient: nutrientKey,
          displayName: this.nutrientDisplayNames[nutrientKey] || nutrientKey,
          effect: mediumEffect,
          direction: mediumEffect > 0 ? 'up' : 'down',
          intensity: this.getEffectIntensity(Math.abs(mediumEffect)),
        });
      }

      if (Math.abs(mechanicalEffect) > this.MOVER_THRESHOLD) {
        effects.mechanical.push({
          nutrient: nutrientKey,
          displayName: this.nutrientDisplayNames[nutrientKey] || nutrientKey,
          effect: mechanicalEffect,
          direction: mechanicalEffect > 0 ? 'up' : 'down',
          intensity: this.getEffectIntensity(Math.abs(mechanicalEffect)),
        });
      }
    }

    // Sort by effect magnitude and limit
    effects.thermal.sort((a, b) => Math.abs(b.effect) - Math.abs(a.effect));
    effects.medium.sort((a, b) => Math.abs(b.effect) - Math.abs(a.effect));
    effects.mechanical.sort((a, b) => Math.abs(b.effect) - Math.abs(a.effect));

    effects.thermal = effects.thermal.slice(0, this.MOVER_DISPLAY_LIMIT);
    effects.medium = effects.medium.slice(0, this.MOVER_DISPLAY_LIMIT);
    effects.mechanical = effects.mechanical.slice(0, this.MOVER_DISPLAY_LIMIT);

    return effects;
  }

  getEffectIntensity(magnitude) {
    if (magnitude > 0.2) return '↑↑↑';
    if (magnitude > 0.1) return '↑↑';
    if (magnitude > 0.04) return '↑';
    return '';
  }

  formatProcessingDescription(ingredient, effects) {
    const parts = [];

    // Add thermal effects
    if (effects.thermal.length > 0) {
      const thermalDesc = ingredient.thermal_description;
      effects.thermal.forEach((effect) => {
        const arrows =
          effect.direction === 'down'
            ? effect.intensity.replace(/↑/g, '↓')
            : effect.intensity;
        parts.push(`${thermalDesc} ${arrows} ${effect.displayName}`);
      });
    }

    // Add medium synergy effects
    if (
      effects.medium.length > 0 &&
      ingredient.heat_medium &&
      ingredient.heat_medium !== 'None'
    ) {
      effects.medium.forEach((effect) => {
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
      effects.mechanical.forEach((effect) => {
        const arrows =
          effect.direction === 'down'
            ? effect.intensity.replace(/↑/g, '↓')
            : effect.intensity;
        parts.push(`${mechDesc} ${arrows} ${effect.displayName}`);
      });
    }

    return parts.join(', ');
  }


  getIngredientsFlat() {
    this.ingredientsFlat = [];
    for (const category of this.recipe.ingredients_editable.ingredients) {
      for (const ingredient of category.ingredients) {
        if (ingredient.amount && ingredient.amount !== 0) {
          if (this.useGpt) {
            const gptIngredientInfo = this.gptIngredients.find(
              (info) => Number(info.ingredient_id) === Number(ingredient.id)
            );
            if (gptIngredientInfo) {
              Object.assign(ingredient, gptIngredientInfo);
            }
            
            const gptHydrationInfo = this.gptHydrationIngredients.find(
              (info) => Number(info.ingredient_id) === Number(ingredient.id)
            );
            if (gptHydrationInfo) {
              ingredient.hydration_factor = gptHydrationInfo.hydration_factor || 1;
              ingredient.consumption_factor = gptHydrationInfo.consumption_factor || 1;
            } else {
              // Set defaults if no GPT hydration info found
              ingredient.hydration_factor = ingredient.hydration_factor || 1;
              ingredient.consumption_factor = ingredient.consumption_factor || 1;
            }
          }
          this.ingredientsFlat.push(ingredient);
        }
      }
    }
    
    // Add vegetable oil if GPT predicted additional fat is needed
    if (this.useGpt && this.recipe.added_fat && this.recipe.added_fat > 0) {
      const oilIngredient = {
        ...vegetableOilData,
        amount: this.recipe.added_fat, // in grams
        unit: 'G',
        hydration_factor: 1,
        consumption_factor: 1,
        thermal_intensity: null,
        heat_medium: null,
        mechanical_disruption: 0,
        thermal_description: null,
        mechanical_description: null
      };
      this.ingredientsFlat.push(oilIngredient);
    }
  }

  getRecipeFoodRows() {
    const recipeFoods = [];
    for (const category of this.recipe.ingredients_editable.ingredients) {
      for (const ingredient of category.ingredients) {
        if (ingredient.amount && ingredient.amount !== 0) {
          recipeFoods.push({
            food_id: ingredient.id,
            unit: ingredient.unit,
            amount: ingredient.amount / this.servingSize,
            category: category.categoryName,
            thermal_intensity:
              thermalGptToDB[ingredient.thermal_intensity] || null,
            heat_medium: ingredient.heat_medium || null,
            mechanical_disruption:
              Number(ingredient.mechanical_disruption) || 0,
            thermal_description: ingredient.thermal_description || null,
            mechanical_description: ingredient.mechanical_description || null,
            hydration_factor: Number(ingredient.hydration_factor) || 1,
            consumption_factor: Number(ingredient.consumption_factor) || 1,
            preperation_description: ingredient.preperation_description || null,
          });
        }
      }
    }
    return recipeFoods;
  }

  getRecipeTagRows() {
    const tagRows = [];
    for (const tag of this.recipe.tags) { // general tags by GPT
      tagRows.push({
        tag_id: tag,
      });
    }
    if(this.ingredientsFlat.length < 5) { // few ingredients
      tagRows.push({
        tag_id: 1,
      });
    }
    if(this.recipe.effort === 'LIGHT') { // light effort
      tagRows.push({
        tag_id: 2,
      });
    }
    if(this.recipe.difficulty === 'EASY') { // easy difficulty
      tagRows.push({
        tag_id: 3,
      });
    }
    if(this.recipeComputed.price < 1) { // budget
      tagRows.push({
        tag_id: 4,
      });
    }
    if(this.recipeComputed.hidx > 70) { // healthy
      tagRows.push({
        tag_id: 100,
      });
    }
    if(this.recipeComputed.mnidx > 70) { // nutritious
      tagRows.push({
        tag_id: 101,
      });
    }
    if(this.ingredientsFlat.every(ingredient => ingredient.vegan)) { // vegan
      tagRows.push({
        tag_id: 102,
      });
    }
    if(this.ingredientsFlat.every(ingredient => ingredient.vegetarian)) { // vegetarian
      tagRows.push({
        tag_id: 103,
      });
    }
    if(this.recipeComputed.protein > 35) { // high protein
      tagRows.push({
        tag_id: 104,
      });
    }
    if(this.recipePer100.carbohydrates < 5) { // low carb
      tagRows.push({
        tag_id: 105,
      });
    }
    if(this.ingredientsFlat.every(ingredient => ingredient.gluten_free)) { // gluten-free
      tagRows.push({
        tag_id: 107,
      });
    }
    if(this.recipeComputed.kcal < 600 && this.recipePer100.kcal < 300) { // low calorie
      tagRows.push({
        tag_id: 108,
      });
    }
    if(this.recipeComputed.satiety > 70) { // high satiety
      tagRows.push({
        tag_id: 109,
      });
    }
    if(this.recipePer100.fat < 3) { // low fat
      tagRows.push({
        tag_id: 110,
      });
    }
    if(this.recipePer100.fiber > 6) { // high fiber
      tagRows.push({
        tag_id: 111,
      });
    }
    return tagRows; 
  }

  async computeRecipe() {
    if (!this.recipe) {
      return;
    }
    let gptResponse = null;
    if (this.useGpt) {
      console.log("🔍 Starting GPT");
      gptResponse = await gptCreateRecipe(this.recipe, this.considerProcessing);
      console.log("🔍 GPT response:", gptResponse);
      this.recipe.saltiness = gptResponse?.salt_and_fat?.saltiness || 1;
      this.recipe.added_fat = gptResponse?.salt_and_fat?.added_fat || 0;
      this.recipeComputed.saltiness = this.recipe.saltiness;
      this.recipeComputed.added_fat = this.recipe.added_fat;
      this.recipeComputed.added_salt = 0; // Will be calculated later
      this.recipe.tags = gptResponse?.general?.tags || [];
      this.recipe.effort = gptResponse?.general?.effort || 'MODERATE';
      this.recipe.difficulty = gptResponse?.general?.difficulty || 'MEDIUM';
    }
    if (this.recipe.saltiness == 0) {
      this.gptTargetSalt = 0;
    } else if (this.recipe.saltiness == 1) {
      this.gptTargetSalt = 0.5;
    } else if (this.recipe.saltiness == 2) {
      this.gptTargetSalt = 1.0;
    } else if (this.recipe.saltiness == 3) {
      this.gptTargetSalt = 1.6;
    }
    this.gptIngredients = gptResponse?.processing?.processing_info || [];
    this.gptHydrationIngredients = gptResponse?.hydration?.ingredients || [];

    this.getIngredientsFlat();
    if (this.ingredientsFlat.length === 0) {
      return;
    }

    this.getCumulCols(this.ingredientsFlat);
    console.log("Recipe before scoring:", this.recipeComputed);
    console.log("🔍 Starting scoring");
    const scores = await this.getScoring();
    Object.assign(this.recipeComputed, scores);
    this.recipeComputed.kcal = Math.round(this.recipeComputed.kcal);

    if (this.logToReport) {
      this.generateReport();
    }
  }

  getCumulCols(ingredients) {
    for (const col in cumulCols) {
      this.cumulColsComputed[col] = {
        amountTotal: 0,
        amountTotalAfterAlpha: 0,
        amountPer100: 0,
        amountPer100AfterAlpha: 0,
        alphaFunction: cumulCols[col],
        contributors: [],
      };
    }

    let intrinsicSalt = 0;
    let addedSaltTotal = 0;

    this.recipeComputed.totalWeight = 0;

    // First pass: calculate basic totals and weight
    for (const ingredient of ingredients) {
      let originalGrams = convertToGrams(
        ingredient.amount,
        ingredient.unit,
        ingredient.density,
        ingredient.unit_weight
      );
      originalGrams = originalGrams / this.servingSize;

      // Apply consumption factor for nutrient calculations
      const consumptionFactor = ingredient.consumption_factor || 1;
      const consumedGrams = originalGrams * consumptionFactor;

      // For total nutrients, use consumed weight
      const nutrientFactor = consumedGrams / 100;

      // For final recipe weight, apply hydration factor to consumed amount
      const hydratedGrams = consumedGrams * (ingredient.hydration_factor || 1);
      this.recipeComputed.totalWeight += hydratedGrams;

      for (const col in this.cumulColsComputed) {
        this.cumulColsComputed[col].amountTotal +=
          ingredient[col] * nutrientFactor;
      }
      
      // Calculate intrinsic salt
      intrinsicSalt += ingredient.salt * nutrientFactor;
    }

    // Calculate per-100g intrinsic salt to compare with target
    const intrinsicSaltPer100g = (intrinsicSalt / this.recipeComputed.totalWeight) * 100;
    
    // If intrinsic salt is below target, add salt to reach target
    if (intrinsicSaltPer100g < this.gptTargetSalt) {
      const targetSaltTotal = (this.gptTargetSalt * this.recipeComputed.totalWeight) / 100;
      addedSaltTotal = targetSaltTotal - intrinsicSalt;
      this.recipeComputed.added_salt = addedSaltTotal;
      this.cumulColsComputed.salt.amountTotal = targetSaltTotal;
    } else {
      this.recipeComputed.added_salt = 0;
      this.cumulColsComputed.salt.amountTotal = intrinsicSalt;
    }

    // Calculate per-100g values for alpha function input
    for (const col in this.cumulColsComputed) {
      this.cumulColsComputed[col].amountPer100 =
        (this.cumulColsComputed[col].amountTotal /
          this.recipeComputed.totalWeight) *
        100;
    }

    const nutrientsPer100 = Object.fromEntries(
      Object.entries(this.cumulColsComputed).map(([col, data]) => [
        col,
        data.amountPer100,
      ])
    );

    // Second pass: apply alpha functions to individual ingredient contributions
    for (const ingredient of ingredients) {
      let originalGrams = convertToGrams(
        ingredient.amount,
        ingredient.unit,
        ingredient.density,
        ingredient.unit_weight
      );
      originalGrams = originalGrams / this.servingSize;

      // Apply consumption factor for nutrient calculations
      const consumptionFactor = ingredient.consumption_factor || 1;
      const consumedGrams = originalGrams * consumptionFactor;
      const nutrientFactor = consumedGrams / 100;

      // Track ingredient data for reporting
      if (this.logToReport) {
        const ingredientNutrients = {};
        for (const col of Object.keys(this.cumulColsComputed)) {
          ingredientNutrients[col] = ingredient[col] * nutrientFactor;
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

      for (const col in this.cumulColsComputed) {
        let alpha = this.cumulColsComputed[col].alphaFunction;
        const alphaValue = alpha(
          nutrientsPer100,
          themalGptToAlpha[ingredient?.thermal_intensity] || 0,
          capitalize(ingredient?.heat_medium || 'None'),
          ingredient?.mechanical_disruption || 0
        );

        const ingredientContribution = ingredient[col] * nutrientFactor;
        const ingredientContributionPer100 =
          (ingredientContribution / this.recipeComputed.totalWeight) * 100;
        const contributionPercentage =
          Math.round(
            (ingredientContribution / this.cumulColsComputed[col].amountTotal) *
              100
          ) / 100;
        if (col == 'sugar') {
          this.cumulColsComputed[col].contributors.push({
            name: ingredient.name,
            value: contributionPercentage,
            totalContribution: ingredientContribution,
            processingLevel: ingredient.nova,
          });
        } else if (contributionPercentage > 0.1) {
          this.cumulColsComputed[col].contributors.push({
            name: ingredient.name,
            value: contributionPercentage,
            totalContribution: ingredientContribution,
          });
        }
        this.cumulColsComputed[col].amountTotalAfterAlpha +=
          alphaValue * ingredientContribution;
        this.cumulColsComputed[col].amountPer100AfterAlpha +=
          alphaValue * ingredientContributionPer100;
      }
    }
    this.cumulColsComputed['salt'] = {
      amountTotal: this.cumulColsComputed.salt.amountTotal,
      amountTotalAfterAlpha: this.cumulColsComputed.salt.amountTotal, 
      amountPer100: (this.cumulColsComputed.salt.amountTotal / this.recipeComputed.totalWeight) * 100,
      amountPer100AfterAlpha: (this.cumulColsComputed.salt.amountTotal / this.recipeComputed.totalWeight) * 100,
      alphaFunction: noAlpha,
    };

    this.recipePer100 = Object.fromEntries(
      Object.entries(this.cumulColsComputed).map(([col, data]) => [
        col,
        data.amountPer100AfterAlpha,
      ])
    );
    const recipeTotalReduced = Object.fromEntries(
      Object.entries(this.cumulColsComputed).map(([col, data]) => [
        col,
        data.amountTotalAfterAlpha,
      ])
    );
    for (const col in this.cumulColsComputed) {
      if (this.cumulColsComputed[col].contributors) {
        this.cumulColsComputed[col].contributors.sort(
          (a, b) => b.value - a.value
        );
      }
    }
    if (this.logToReport) {
      this.report.contributors = this.cumulColsComputed;
    }
    Object.assign(this.recipeComputed, recipeTotalReduced);
  }

  scale_by_points(value, points) {
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
    let perGramScore = 0;
    let perKcalScore = 0;
    let perServingScore = 0;
    const micronutrientDetails = [];

    for (const nutrient of micronutrient_weights) {
      const name = nutrient['name'];
      const weight = nutrient['weight'];
      const rda = nutrient['rda'];

      const rawValue = this.recipePer100[name] || 0;

      const perGramContribution =
        weight * Math.min(2, Math.log(rawValue / rda + 1));
      perGramScore += perGramContribution;

      // perKcalContribution: nutrients per 200kcal of food
      const perKcalContribution =
        perGramContribution * (200 / this.recipePer100.kcal);
      perKcalScore += perKcalContribution;

      // perServingContribution: nutrients per 500g of food
      const perServingContribution =
        perGramContribution * (this.recipeComputed.totalWeight / 300);
      perServingScore += perServingContribution;

      if (this.logToReport && perGramContribution > 0) {
        micronutrientDetails.push({
          name,
          displayName: this.nutrientDisplayNames[name] || name,
          value: Math.round(rawValue * 100) / 100,
          rdaPerServing: Math.round(
            (rawValue * this.recipeComputed.totalWeight) / rda
          ),
          rdaPer100: Math.round((rawValue * 100) / rda),
          perGramContribution: perGramContribution,
          perKcalContribution: perKcalContribution,
          perServingContribution: perServingContribution,
        });
      }
    }
    const scaledPerKcalScore = this.scale_by_points(perKcalScore * 20, [
      [0, 0],
      [75, 100],
      [100, 150],
    ]);
    const scaledPerGramScore = this.scale_by_points(perGramScore * 20, [
      [0, 0],
      [75, 100],
      [100, 150],
    ]);
    const scaledPerServingScore = this.scale_by_points(perServingScore * 20, [
      [0, 0],
      [75, 100],
      [100, 150],
    ]);
    const weightedTotalScore =
      0.6 * scaledPerKcalScore +
      0.3 * scaledPerGramScore +
      0.1 * scaledPerServingScore;
    if (this.logToReport) {
      micronutrientDetails.sort((a, b) => b.perGramContribution - a.perGramContribution);
      this.report.micronutrients = {
        total_score: weightedTotalScore,
        perGramScore: scaledPerGramScore,
        perKcalScore: scaledPerKcalScore,
        perServingScore: scaledPerServingScore,
        grade: getGrade(weightedTotalScore, 'score'),
        details: micronutrientDetails,
      };
    }

    return weightedTotalScore;
  }
  curve(x) {
    if (x > 1) {
      return 0;
    } else {
      return 0.2 * Math.exp(-5 * x);
    }
  }

  async getSIDX() {
    if(this.recipePer100.kcal == 0) {
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

    const is_liquid_whole_word = (name) => {
      const words = name.toLowerCase().split(' ');
      const words_cleaned = words.map((word) => word.replace(/[^\w\s]/g, ''));
      return liquid_keywords.some((kw) => words_cleaned.includes(kw));
    };

    let waterE = this.recipePer100.water;
    if (is_liquid_whole_word(this?.recipeComputed?.title ?? '')) {
      waterE = waterE * 0.1;
    } else if (this.recipePer100?.nova <= 2) {
      waterE = waterE;
    } else if (
      this.recipePer100.kcal > 10 &&
      waterE / this.recipePer100.kcal > 5
    ) {
      waterE = waterE * 0.9;
    } else {
      const sigmoid =
        1 /
        (1 +
          Math.exp(
            -2 *
              (this.recipePer100.carbohydrates -
                this.recipePer100.sugar +
                this.recipePer100.fiber +
                0.2929598406929533 * this.recipePer100.protein -
                1.054166862782954)
          ));
      waterE = waterE * sigmoid;
    }
    const starch_grams = Math.max(
      0,
      this.recipePer100.carbohydrates -
        this.recipePer100.sugar -
        this.recipePer100.fiber
    );
    const giProxy =
      (1.2693123441054426 * this.recipePer100.sugar + starch_grams) /
      (this.recipePer100.carbohydrates + 1e-6);
    let ff = 0;
    if (this.recipePer100.kcal == 0) {
      ff = 0;
    } else {
      ff = Math.min(
        5,
        Math.max(
          0.5,
          41.7 / this.recipePer100.kcal ** 0.7 +
            0.05 * this.recipePer100.protein +
            0.000617 * this.recipePer100.fiber ** 3 -
            0.00000725 * this.recipePer100.fat ** 3 +
            0.617
        )
      );
    }

    if (this.logToReport) {
      this.report.satiety = {
        ff: ff,
        giProxy: Math.round((giProxy - 0.9) * 100),
        water: this.recipePer100.water,
        kcal: this.recipePer100.kcal,
      };
    }

    const body = {
      ff: ff,
      giProxy: giProxy,
      waterE: waterE,
      kcal: this.recipePer100.kcal,
    };
    const prediction = await predictSatiety(body);
    return this.scale_by_points(prediction, [
      [10, 0],
      [40, 50],
      [50, 72],
      [60, 80],
      [93, 100],
    ]);
  }

  getFiberScore() {
    const fiberRDA = 25;
    const fiberScore = this.scale_by_points(this.recipePer100.fiber, [
      [0, 0],
      [1.5, 50],
      [10, 150],
    ]);
    if (this.logToReport) {
      this.report.fiber = {
        fiberPer100g: this.recipePer100.fiber,
        fiberRDAPerServing: this.recipeComputed.fiber / fiberRDA,
      };
    }
    return fiberScore;
  }

  getSaltScore() {
    const saltRDA = 5;
    
    // na in mg = nacl * 0.4 * 1000
    const na_k = this.recipePer100.salt * 1000 * 0.4 / (this.recipePer100.potassium_mg + 1e-6);

    const na_k_score = 100 - this.scale_by_points(na_k, [
      [0.2, -20],
      [0.5, 0],
      [2, 55],
      [3, 100],
      [5, 150]
    ]);

    const total_salt_score = this.scale_by_points(this.recipePer100.salt, [
      [0, 100],
      [2, 0],
      [20, -100],
    ]);

    if (this.logToReport) {
      this.report.salt = {
        saltPer100g: this.recipePer100.salt,
        saltRDAPerServing: this.recipeComputed.salt / saltRDA,
        na_k_ratio: na_k
      };
    }

    return 0.7*na_k_score + 0.3*total_salt_score;
  }

  getSugarScore() {
    const points = [
      [0, 100],
      [5, 50],
      [20, 0],
      [100, -200],
    ];
    const score = this.scale_by_points(this.recipePer100.sugar, points);

    if (this.logToReport) {
      let percentContributedFromNaturalScources = 0;
      for (const contributor of this.cumulColsComputed.sugar.contributors) {
        if (contributor.processingLevel <= 2) {
          percentContributedFromNaturalScources += contributor.value;
        }
      }
      const percentOfKcal =
        (this.recipePer100.sugar * 4) / (this.recipePer100.kcal + 1e-6);
      this.report.sugar = {
        totalSugarPer100: this.recipePer100.sugar,
        percentContributedFromNaturalScources,
        percentOfKcal,
        score,
      };
    }
    return score;
  }

  getFatProfileScore() {
    if (this.recipePer100.fat == 0) {
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
    const fat_mg = this.recipePer100.fat * 1000;

    const sfat_score =
      100 -
      this.scale_by_points(
        this.recipePer100.saturated_fat / this.recipePer100.fat,
        [
          [0.05, 0],
          [1, 200],
        ]
      );

    const o3_score = this.scale_by_points(
      this.recipePer100.omega3_total_mg / fat_mg,
      [
        [0.0, 0],
        [0.25, 150],
      ]
    );

    const o6_score = this.scale_by_points(
      this.recipePer100.omega6_total_mg / fat_mg,
      [
        [0.0, 0],
        [0.5, 100],
      ]
    );

    const mufa_score = this.scale_by_points(
      this.recipePer100.mufas_total_mg / fat_mg,
      [
        [0.0, 0],
        [1, 150],
      ]
    );

    const o_ratio_score = this.scale_by_points(
      this.recipePer100.omega3_total_mg /
        (this.recipePer100.omega6_total_mg + 1e-10),
      [
        [0, 0],
        [0.25, 80],
        [2, 200],
      ]
    );

    const trans_score =
      100 -
      this.scale_by_points(this.recipePer100.trans_fats_mg, [
        [0, 0],
        [3000, 100],
      ]);

    let total =
      0.5 * sfat_score +
      0.5 * o_ratio_score +
      0.3 * o3_score +
      0.3 * mufa_score +
      0.1 * o6_score +
      trans_score -
      100;

    //const totalScore = this.scale_by_points(total, [
    //  [10, 0],
    //  [100, 100],
    //]);
    const totalScore = total;
    const weight =
      (1 - Math.exp(-0.2 * this.recipePer100.fat)) /
      (1 + Math.exp(-this.recipePer100.fat + 3));
    const counterWeight = 1 - weight;
    const compoundScore = counterWeight * 50 + weight * totalScore;

    if (this.logToReport) {
      this.report.fatProfile = {
        saturated_score: Math.round(sfat_score),
        omega3_score: Math.round(o3_score),
        omega6_score: Math.round(o6_score),
        mufa_score: Math.round(mufa_score),
        ratio_score: Math.round(o_ratio_score),
        trans_score: Math.round(trans_score) / 2,
        final_score: Math.round(compoundScore),
        saturated_fat_per_fat:
          this.recipePer100.saturated_fat / this.recipePer100.fat,
        omega3_per_fat: this.recipePer100.omega3_total_mg / fat_mg,
        omega6_per_fat: this.recipePer100.omega6_total_mg / fat_mg,
        mufa_per_fat: this.recipePer100.mufas_total_mg / fat_mg,
        omega_ratio:
          this.recipePer100.omega3_total_mg / this.recipePer100.omega6_total_mg,
        trans: this.recipePer100.trans_fats_mg,
      };
    }

    return compoundScore;
  }

  getED() {
    return this.scale_by_points(this.recipePer100.kcal, [
      [0, 100],
      [800, -50],
    ]);
  }

  getProtectiveCompoundScore() {
    const polyphenols = this.recipePer100.polyphenols;
    const carotenoids = this.recipePer100.carotenoids;
    const glucosinolates = this.recipePer100.glucosinolates;

    const score =
      (0.5 * polyphenols + 0.3 * carotenoids + 0.2 * glucosinolates) * 15;

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
    const ratio_score = this.scale_by_points(
      (this.recipePer100.protein * 4) / (this.recipePer100.kcal + 1e-6),
      [
        [0, 0],
        [0.05, 20],
        [0.2, 60],
        [0.4, 80],
        [0.7, 110],
        [1, 180],
      ]
    );

    const total_score = this.scale_by_points(this.recipePer100.protein, [
      [0, 0],
      [1, 10],
      [6, 50],
      [10, 70],
      [25, 90],
      [100, 200],
    ]);
    return 0.6 * ratio_score + 0.5 * total_score;
  }

  getProteinQualityScore() {
    const protein = this.recipePer100.protein;
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
      Histidine: this.recipePer100.histidine_mg,
      Isoleucine: this.recipePer100.isoleucine_mg,
      Leucine: this.recipePer100.leucine_mg,
      Lysine: this.recipePer100.lysine_mg,
      SAA: this.recipePer100.methionine_mg + this.recipePer100.cysteine_mg,
      AAA: this.recipePer100.phenylalanine_mg + this.recipePer100.tyrosine_mg,
      Threonine: this.recipePer100.threonine_mg,
      Tryptophan: this.recipePer100.tryptophan_mg,
      Valine: this.recipePer100.valine_mg,
    };

    const ratios = Object.keys(ref).map((aa) => ({
      aa,
      ratio: actual[aa] / this.recipePer100.protein / ref[aa],
    }));

    const limitingAA = ratios.reduce((min, current) =>
      current.ratio < min.ratio ? current : min
    );

    this.report.protein.limitingAA = limitingAA.aa;
    this.report.protein.limitingAA_ratio = limitingAA.ratio;

    return this.scale_by_points(limitingAA.ratio, [
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
          Math.round(this.recipePer100.protein * 100) / 100,
        total_protein_per_serving:
          this.cumulColsComputed.protein.amountTotalAfterAlpha,
        protein_kcal_ratio:
          (this.recipePer100.protein * 4) / (this.recipePer100.kcal + 1e-6),
        overall_score: Math.round(ovr),
      };
    }

    return ovr;
  }

  getPLScore() {
    if(this.isFood) {
      return 100-(((this.recipePer100?.nova)-1)*30)
    }
    let whole_food_count = 0;
    let ultra_processed_count = 0;
    for (const ingredient of this.ingredientsFlat) {
      if (ingredient.nova == 1) {
        whole_food_count++;
      } else if (ingredient.nova == 4) {
        ultra_processed_count++;
      }
    }

    const whole_food_percentage =
      whole_food_count / this.ingredientsFlat.length;
    const ultra_processed_percentage =
      ultra_processed_count / this.ingredientsFlat.length;

    const processing_level_score =
    100-(((this.recipePer100?.nova)-1)*30)

    const whole_food_score = whole_food_percentage * 100;

    const ultra_processed_score = (1 - ultra_processed_percentage*1.5) * 100;

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
    satiety,
    protein,
    fiber,
    sugar,
    fat_profile,
    salt,
    mnidx,
    pl,
    protective_compound_score
  ) {
    const hidx =
      1/6 * satiety + //satiety ; proxy for overeating/obesity risk
      1/8 * fiber + //direct positive impact
      1/9 * pl + //processing level, proxy for additives or unwanted processing side effects.
      // https://link.springer.com/article/10.1186/s13643-025-02800-8
      // 10% increase in UPF -> 10% risk of all-cause mortality
      1/9 * fat_profile + //direct impact, mixed based on fatty acid profile
      1/9 * mnidx + //direct positive impact
      1/9 * protein + //direct positive impact
      1/9 * sugar + //direct negative impact
      // https://www.mdpi.com/2072-6643/13/8/2636
      // 1 extra soda -> 10% risk of all-cause mortality
      1/9 * salt + //direct negative impact
      //https://www.nejm.org/doi/full/10.1056/NEJMoa1311889
      // J-shaped curve, >7g / day -> +25% all-cause mortality
      1/13 * protective_compound_score; //direct positive impact

    const MIN = 25;
    const MAX = 83;
    const scaled = ((hidx - MIN) * 100) / (MAX - MIN);
    return scaled;
  }

  async getScoring() {
    const processing_level_factor =
      this.recipePer100.nova <= 2 ? 0.8 : 1.4;
    this.recipePer100.water = Math.max(
      0,
      100 -
        (this.recipePer100.protein +
          this.recipePer100.fat +
          this.recipePer100.carbohydrates +
          this.recipePer100.fiber +
          processing_level_factor)
    );

    const ed = this.getED();
    const sidx = await this.getSIDX();
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

    const scores = {
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

  generateReport() {
    // Overall grade and details
    this.report.overall = {
      hidx: this.recipeComputed.hidx,
      sidx: this.recipeComputed.sidx,
      satiety: this.recipeComputed.satiety,
      protein_score: this.recipeComputed.protein_score,
      salt_score: this.recipeComputed.salt_score,
      fiber_score: this.recipeComputed.fiber_score,
      sugar_score: this.recipeComputed.sugar_score,
      fat_profile_score: this.recipeComputed.fat_profile_score,
      mnidx: this.recipeComputed.mnidx,
      processing_level_score: this.recipeComputed.processing_level_score,
      protective_score: this.recipeComputed.protective_score,
      grade: getGrade(this.recipeComputed.hidx, 'hidx'),
      total_weight: Math.round(this.recipeComputed.totalWeight),
      kcal_per_100g: Math.round(this.recipePer100.kcal),
      serving_size: this.servingSize,
    };

    // Process ingredient-level analysis
    this.report.processingEffects = [];

    for (const ingredientData of this.report.ingredientNutrients) {
      const ingredient = this.ingredientsFlat.find(
        (ing) => ing.name === ingredientData.name
      );
      if (!ingredient) continue;

      const effects = this.analyzeProcessingEffects(
        ingredient,
        this.recipePer100
      );
      const description = this.formatProcessingDescription(ingredient, effects);

      if (description) {
        this.report.processingEffects.push({
          ingredient: ingredient.name,
          weight: Math.round(ingredientData.weight),
          description,
          effects,
        });
      }
    }

    this.report.humanReadable = getReportHumanReadable(
      this.report,
      this.recipeComputed
    );
  }
}
