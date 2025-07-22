import { alpha_vitaminA, alpha_vitaminB1, alpha_vitaminB2, alpha_vitaminB3, alpha_vitaminB6, alpha_vitaminB9, alpha_vitaminB12, alpha_vitaminC, alpha_vitaminD, alpha_vitaminE, alpha_vitaminK, alpha_iron, alpha_magnesium, alpha_zinc, alpha_calcium, alpha_potassium, alpha_selenium, alpha_iodine, alpha_copper, alpha_manganese, alpha_omega3, alpha_omega6, alpha_MUFA, alpha_EAAs_except_Lysine, alpha_lysine, alpha_glucosinolates, alpha_polyphenols, alpha_carotenoids, alpha_choline } from './alphas';


function convertUnit(unit: string) {
  if (['g', 'tsp', 'tbsp', 'ml'].includes(unit)) {
    return unit.toUpperCase();
  } else {
    return 'UNITS';
  }
}

const themalGptToAlpha = {
  "LOW": 0,
  "MEDIUM": 1,
  "HIGH": 2,
}

const thermalGptToDB = {
  "LOW": "LOW (50C-99C)",
  "MEDIUM": "MEDIUM (100C-180C)",
  "HIGH": "HIGH (180+C)",
}

function getInfoTrivial(ingredients: Array, servingSize: number, saltiness: number) {
  const noAlpha = (row, T, M, D) => 1;
  const infoCumulCols = {
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
    polyphenols_total_mg: alpha_polyphenols,
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
  };

  let targetSalt = 0.2;
  if(saltiness == 1) {
      targetSalt = 0.7;
    }
    else if(saltiness == 2) {
      targetSalt = 1.1;
    }
    else if(saltiness == 3) {
      targetSalt = 1.6;
    }


  const infoResults: any = {};
  const infoResultsPer100gForAlpha: any = {};

  for (const info of Object.keys(infoCumulCols)) {
    infoResults[info] = 0;
  }
  for (const info of Object.keys(infoCumulCols)) {
    infoResultsPer100gForAlpha[info] = 0;
  }
  infoResultsPer100gForAlpha['total_weight'] = 0;

  //TODO: Make cleaner
  for (const ingredient of ingredients) {
    const unit = convertUnit(ingredient.unit);
    let grams = getGrams(
      ingredient.amount,
      unit,
      ingredient.density,
      ingredient.unit_weight
    );
    if(ingredient.hydration_factor) {
      grams = grams * ingredient.hydration_factor;
    }
    const factor = grams / 100 / servingSize;
    infoResultsPer100gForAlpha['total_weight'] += grams / servingSize;
    for (const info of Object.keys(infoCumulCols)) {
      infoResultsPer100gForAlpha[info] += ingredient[info] * factor;
    }
  }

  for (const info of Object.keys(infoCumulCols)) {
    infoResultsPer100gForAlpha[info] = infoResultsPer100gForAlpha[info] / infoResultsPer100gForAlpha['total_weight'] * 100;
  }
  console.log(infoResultsPer100gForAlpha);
  
  infoResults['total_weight'] = 0;
  infoResults['price'] = 0;
  infoResults['salt'] = 0;
  let cumulProcessingLevel = 0;
  for (const ingredient of ingredients) {
    const unit = convertUnit(ingredient.unit);
    let grams = getGrams(
      ingredient.amount,
      unit,
      ingredient.density,
      ingredient.unit_weight
    );
    const factor = grams / 100 / servingSize;
    infoResults['total_weight'] += grams / servingSize * (ingredient.hydration_factor || 1);
    infoResults['price'] += ingredient.price * factor;
    cumulProcessingLevel += ingredient.processing_level * factor * (ingredient.hydration_factor || 1);
    for (const info of Object.keys(infoCumulCols)) {
      infoResults[info] += (
        infoCumulCols[info](infoResultsPer100gForAlpha, themalGptToAlpha[ingredient?.thermal_intensity as keyof typeof themalGptToAlpha] || 0, capitalize(ingredient?.heat_medium || "None"), ingredient?.mechanical_disruption || 0) *
        ingredient[info] * factor);
    }
    if(ingredient.salt < targetSalt) {
      infoResults['salt'] += targetSalt * factor;
    }
    else {
      infoResults['salt'] += ingredient.salt * factor;
    }
  }
  infoResults['processing_level'] =
    cumulProcessingLevel / infoResults['total_weight'] * 100;
  return infoResults;
}

export default async function computeRecipe(recipe: any, final: boolean = false) {
  let gptResponse = null;
  if (final) {
    gptResponse = await gptCreateRecipe(recipe);
  }
  let recipeComputed = {
    title: recipe?.title,
    description: recipe?.description,
    effort: recipe?.effort?.toUpperCase(),
    difficulty: recipe?.difficulty?.toUpperCase(),
    visibility: recipe?.visibility?.toUpperCase(),
    instructions: recipe?.instructions,
  };
  const recipeFoods = [];
  const recipeTags = [];
  const servingSize = recipe.ingredients_pre.servingSize;
  const ingredientsFlat = [];
  for (const category of recipe.ingredients_pre.ingredients) {
    for (const ingredient of category.ingredients) {
      if (ingredient.amount !== 0) {
      if(final) {
        const gptIngredientInfo = gptResponse.processing_info.find((info: any) => info.ingredient_name === ingredient.name);
        if(gptIngredientInfo) {
          Object.assign(ingredient, gptIngredientInfo);
        }
      }
      recipeFoods.push({
        food_id: ingredient.id,
        unit: convertUnit(ingredient.unit),
        amount: ingredient.amount / servingSize,
        category: category.categoryName,
        thermal_intensity: thermalGptToDB[ingredient.thermal_intensity as keyof typeof thermalGptToDB] || null,
        heat_medium: ingredient.heat_medium || null,
        mechanical_disruption: Number(ingredient.mechanical_disruption) || 0,
        thermal_description: ingredient.thermal_description || null,
        mechanical_description: ingredient.mechanical_description || null,
        hydration_factor: Number(ingredient.hydration_factor) || 1,
      });
      ingredientsFlat.push(ingredient);
      }
    }
  }
  if (ingredientsFlat.length === 0) {
    return {
      recipeComputed: stripKeys(recipeComputed, recipeKeys),
      recipeFoods,
      recipeTags,
    };
  }

  Object.assign(recipeComputed, getInfoTrivial(ingredientsFlat, servingSize, gptResponse?.saltiness || 1));
  const scoreCalculator = new ScoreCalculator(
    recipeComputed,
    recipeComputed.total_weight
  );
  const scores = await scoreCalculator.calculate();
  Object.assign(recipeComputed, scores);

  recipeComputed.kcal = Math.round(recipeComputed.kcal);
  for (const tag of recipe.tags) {
    recipeTags.push({ tag_id: tag });
  }
  if (ingredientsFlat.every((ingredient) => ingredient.vegan)) {
    recipeTags.push({ tag_id: 62 });
  }
  if (ingredientsFlat.every((ingredient) => ingredient.vegetarian)) {
    recipeTags.push({ tag_id: 63 });
  }
  if (ingredientsFlat.every((ingredient) => ingredient.gluten_free)) {
    recipeTags.push({ tag_id: 68 });
  }
  if (recipeComputed.difficulty === 'EASY') {
    recipeTags.push({ tag_id: 71 });
  }
  if (recipeComputed.effort === 'LIGHT') {
    recipeTags.push({ tag_id: 70 });
  }
  if (recipeComputed.carbohydrates / recipeComputed.total_weight < 0.07) {
    recipeTags.push({ tag_id: 64 });
  }
  if (recipeComputed.protein * 4 > 0.2 * recipeComputed.kcal) {
    recipeTags.push({ tag_id: 67 });
  }
  if (ingredientsFlat.length < 5) {
    recipeTags.push({ tag_id: 69 });
  }

  return {
    recipeComputed: stripKeys(recipeComputed, recipeKeys),
    recipeFoods,
    recipeTags,
  };
}
