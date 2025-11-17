export function getBrandedFoodRequirements(brandedFood: BrandedFood) {
  const hasName = !!brandedFood.product_name;
  const hasFullNutritionLabel =
    brandedFood.kcal != null &&
    brandedFood.protein != null &&
    brandedFood.fat != null &&
    brandedFood.carbohydrates != null &&
    brandedFood.fiber != null &&
    brandedFood.sugar != null &&
    brandedFood.saturated_fat != null &&
    brandedFood.salt != null
  const hasMatchedFood = !!brandedFood.matched_food_name_id;
  return {
    isComplete: hasName && hasFullNutritionLabel && hasMatchedFood,
    hasName,
    hasFullNutritionLabel,
    hasMatchedFood,
  };
}
