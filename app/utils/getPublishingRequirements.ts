export const getPublishingRequirements = (
  recipe: { instructions?: string[] | null; picture?: string | null } | null
) => {
  if (!recipe) {
    return {
      hasInstructions: false,
      hasPicture: false,
      instructionsMatchedToIngredients: false,
    };
  }
  const hasInstructions =
    recipe.instructions &&
    recipe.instructions.length > 0 &&
    recipe.instructions.every((instruction) => instruction.trim() !== '') &&
    recipe.instructions.some(
      (instruction) => instruction.trim().split(' ').length > 2
    );

  const hasPicture = Boolean(recipe.picture);

  const instructionsMatchedToIngredients =
    recipe.instructions &&
    recipe.instructions.some((instruction) =>
      instruction.match(/\[.*?\]\((\d+)\)/g)
    );

  return {
    hasInstructions,
    hasPicture,
    instructionsMatchedToIngredients,
  };
};
