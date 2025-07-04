function convertUnit(unit: string) {
  if (['g', 'tsp', 'tbsp', 'ml'].includes(unit)) {
    return unit.toUpperCase();
  } else {
    return 'UNITS';
  }
}

function getInfoTrivial(ingredients: Array, servingSize: number) {
  const infoCumulCols = [
    'kcal',
    'protein',
    'carbohydrates',
    'fat',
    'saturated_fat',
    'sugar',
    'fiber',
    'salt',
    'price',
    'iron_mg',
    'magnesium_mg',
    'zinc_mg',
    'calcium_mg',
    'potassium_mg',
    'selenium_ug',
    'iodine_ug',
    'copper_mg',
    'manganese_mg',
    'vitamin_a_ug_rae',
    'vitamin_c_mg',
    'vitamin_d_ug',
    'vitamin_e_mg_alpha_te',
    'vitamin_k_ug',
    'thiamine_b1_mg',
    'riboflavin_b2_mg',
    'niacin_b3_mg',
    'vitamin_b6_mg',
    'folate_ug_dfe',
    'vitamin_b12_ug',
    'trans_fats_mg',
    'mufas_total_mg',
    'polyphenols_total_mg',
    'choline_mg',
    'omega6_total_mg',
    'omega3_total_mg',
  ];
  const infoResults: any = {};
  for (const info of infoCumulCols) {
    infoResults[info] = 0;
  }
  infoResults['total_weight'] = 0;
  infoResults['price'] = 0;
  let cumulProcessingLevel = 0;
  for (const ingredient of ingredients) {
    const unit = convertUnit(ingredient.unit);
    const grams = getGrams(
      ingredient.amount,
      unit,
      ingredient.density,
      ingredient.unit_weight
    );
    const factor = grams / 100 / servingSize;
    infoResults['total_weight'] += grams / servingSize;
    infoResults['price'] += ingredient.price * factor;
    cumulProcessingLevel += ingredient.processing_level * factor;
    for (const info of infoCumulCols) {
      infoResults[info] += ingredient[info] * factor;
    }
  }
  infoResults['processing_level'] =
    cumulProcessingLevel / infoResults['total_weight'] * 100;
  return infoResults;
}

export default async function computeRecipe(recipe: any) {
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
      recipeFoods.push({
        food_id: ingredient.id,
        unit: convertUnit(ingredient.unit),
        amount: ingredient.amount / servingSize,
        category: category.categoryName,
      });
      ingredientsFlat.push(ingredient);
    }
  }
  Object.assign(recipeComputed, getInfoTrivial(ingredientsFlat, servingSize));
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
