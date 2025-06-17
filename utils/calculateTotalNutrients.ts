function convertToGrams({ amount, unit, density, unit_weight }) {
  const num = Number(amount);
  if (isNaN(num) || num <= 0) return 0;

  switch (unit) {
    case 'G':
      return num;
    case 'ML':
      return num * density;
    case 'TSP':
      return num * 5 * density;
    case 'TBSP':
      return num * 15 * density;
    case 'PCS':
      return num * unit_weight;
    default:
      return 0;
  }
}

export default function calculateTotalNutrients(ingredients) {
  const totals = {
    kcal: 0,
    protein: 0,
    carbohydrates: 0,
    sugar: 0,
    fat: 0,
    saturated_fat: 0,
    fiber: 0,
    salt: 0,
    price: 0,
  };

  ingredients.forEach((item) => {
    const grams = convertToGrams(item);
    const factor = grams / 100;
    totals.kcal += item.kcal * factor;
    totals.protein += item.protein * factor;
    totals.carbohydrates += item.carbohydrates * factor;
    totals.sugar += item.sugar * factor;
    totals.fat += item.fat * factor;
    totals.saturated_fat += item.saturated_fat * factor;
    totals.fiber += item.fiber * factor;
    totals.salt += item.salt * factor;
    totals.price += item.price * factor;
  });
  totals.kcal = Math.round(totals.kcal);

  return totals;
}
