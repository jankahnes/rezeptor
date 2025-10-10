export default function getStringFromIngredients(
  ingredients: any,
  serves?: number
) {
  const groupedIngredients = groupIngredients(ingredients);

  const getIngredientsString = (ingredients: any[]) => {
    return (
      ingredients
        ?.map(
          (ingredient) =>
            `${ingredient.name}: ${getStringFromAmountInfo(
              ingredient.amountInfo[ingredient.currentUnit],
              serves || 1
            )}`
        )
        .join('\n') ?? ''
    );
  };
  let ingredientsString = '';
  for (const [category, group] of Object.entries(groupedIngredients)) {
    if (category === 'uncategorized') {
      ingredientsString += getIngredientsString(group) + '\n';
    } else {
      ingredientsString += `\n${category}:\n`;
      ingredientsString += getIngredientsString(group) + '\n';
    }
  }
  return ingredientsString;
}
