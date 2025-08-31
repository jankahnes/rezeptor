export const TAGS = [
  { id: 1, name: 'few ingredients', value: 8, category: 'GENERAL' }, //auto, ingredients.length < 5
  { id: 2, name: 'quick', value: 8, category: 'GENERAL' }, //auto, effort = LIGHT
  { id: 3, name: 'easy', value: 8, category: 'GENERAL' }, //auto, difficulty = EASY
  { id: 4, name: 'budget', value: 14, category: 'GENERAL' }, //auto, price < 1
  { id: 5, name: 'meal prep', value: 12, category: 'GENERAL' }, // ai
  { id: 6, name: 'family friendly', value: 4, category: 'GENERAL' }, // ai
  { id: 7, name: 'gourmet', value: 4, category: 'GENERAL' }, // ai
  { id: 8, name: 'date night', value: 4, category: 'GENERAL' }, // ai
  { id: 9, name: 'comfort food', value: 4, category: 'GENERAL' }, // ai
  { id: 10, name: 'one pot', value: 8, category: 'GENERAL' }, // ai
  { id: 11, name: 'no cooking', value: 4, category: 'GENERAL' }, // ai
  { id: 12, name: 'clean eating', value: 4, category: 'GENERAL' }, // ai
  { id: 13, name: 'potluck', value: 4, category: 'GENERAL' }, // ai

  { id: 100, name: 'healthy', value: 10, category: 'DIET' }, //auto, hidx > 70
  { id: 101, name: 'nutritious', value: 10, category: 'DIET' }, //auto, mnidx > 70
  { id: 102, name: 'vegan', value: 2, category: 'DIET' }, //auto, ingredients.all(ingredient => ingredient.tags.includes('vegan'))
  { id: 103, name: 'vegetarian', value: 2, category: 'DIET' }, //auto, ingredients.all(ingredient => ingredient.tags.includes('vegetarian'))
  { id: 104, name: 'high protein', value: 6, category: 'DIET' }, //auto, protein_score > 70
  { id: 105, name: 'low carb', value: 6, category: 'DIET' }, //auto, per100.carbs < 5
  { id: 106, name: 'paleo', value: 2, category: 'DIET' }, //ai
  { id: 107, name: 'gluten free', value: 2, category: 'DIET' }, //auto, ingredients.all(ingredient => ingredient.tags.includes('gluten free'))
  { id: 108, name: 'low calorie', value: 14, category: 'DIET' }, //auto, kcal < 600
  { id: 109, name: 'satiating', value: -1, category: 'DIET' }, //auto, satiety > 70
  { id: 110, name: 'low fat', value: 6, category: 'DIET' }, //auto, per100.fat < 3
  { id: 111, name: 'high fiber', value: 6, category: 'DIET' }, //auto, per100.fiber > 6
  { id: 112, name: 'lactose free', value: 2, category: 'DIET' }, //auto, ingredients.all(ingredient => ingredient.tags.includes('lactose free'))

  { id: 200, name: 'main/dinner', value: 0, category: 'TYPE' }, //ai
  { id: 201, name: 'breakfast', value: 0, category: 'TYPE' }, //ai
  { id: 202, name: 'side', value: 0, category: 'TYPE' }, //ai
  { id: 203, name: 'snack', value: 0, category: 'TYPE' }, //ai
  { id: 204, name: 'dessert', value: 0, category: 'TYPE' }, //ai
  { id: 205, name: 'lunch', value: 0, category: 'TYPE' }, //ai
  { id: 206, name: 'appetizer', value: 0, category: 'TYPE' }, //ai
  { id: 207, name: 'soup', value: 0, category: 'TYPE' }, //ai
  { id: 208, name: 'salad', value: 0, category: 'TYPE' }, //ai
  { id: 209, name: 'drink', value: 0, category: 'TYPE' }, //ai
  { id: 210, name: 'wrap', value: 0, category: 'TYPE' }, //ai
  { id: 211, name: 'bowl', value: 0, category: 'TYPE' }, //ai
  { id: 212, name: 'stir fry', value: 0, category: 'TYPE' }, //ai
  { id: 213, name: 'pasta', value: 0, category: 'TYPE' }, //ai
  { id: 214, name: 'sandwich', value: 0, category: 'TYPE' }, //ai
  { id: 215, name: 'dip', value: 0, category: 'TYPE' }, //ai
  { id: 216, name: 'casserole', value: 0, category: 'TYPE' }, //ai
  { id: 217, name: 'cocktail', value: 0, category: 'TYPE' }, //ai
  { id: 218, name: 'savory baked good / bread', value: 0, category: 'TYPE' }, //ai
  { id: 219, name: 'sweet baked good', value: 0, category: 'TYPE' }, //ai

  { id: 300, name: 'global', value: 3, category: 'CUISINE' }, //ai
  { id: 301, name: 'fusion', value: 5, category: 'CUISINE' }, //ai
  { id: 302, name: 'italian', value: 3, category: 'CUISINE' }, //ai
  { id: 303, name: 'german', value: 3, category: 'CUISINE' }, //ai
  { id: 304, name: 'american', value: 3, category: 'CUISINE' }, //ai
  { id: 305, name: 'vietnamese', value: 3, category: 'CUISINE' }, //ai
  { id: 306, name: 'chinese', value: 3, category: 'CUISINE' }, //ai
  { id: 307, name: 'japanese', value: 3, category: 'CUISINE' }, //ai
  { id: 308, name: 'french', value: 3, category: 'CUISINE' }, //ai
  { id: 309, name: 'british', value: 3, category: 'CUISINE' }, //ai
  { id: 310, name: 'indian', value: 3, category: 'CUISINE' }, //ai
  { id: 311, name: 'spanish', value: 3, category: 'CUISINE' }, //ai
  { id: 312, name: 'middle eastern', value: 3, category: 'CUISINE' }, //ai
  { id: 313, name: 'thai', value: 3, category: 'CUISINE' }, //ai
  { id: 314, name: 'mediterranean', value: 3, category: 'CUISINE' }, //ai
  { id: 315, name: 'greek', value: 3, category: 'CUISINE' }, //ai
  { id: 316, name: 'turkish', value: 3, category: 'CUISINE' }, //ai
  { id: 317, name: 'portuguese', value: 3, category: 'CUISINE' }, //ai
  { id: 318, name: 'eastern european', value: 3, category: 'CUISINE' }, //ai
  { id: 319, name: 'scandinavian', value: 3, category: 'CUISINE' }, //ai
  { id: 320, name: 'basque', value: 3, category: 'CUISINE' }, //ai
  { id: 321, name: 'korean', value: 3, category: 'CUISINE' }, //ai
  { id: 322, name: 'malaysian', value: 3, category: 'CUISINE' }, //ai
  { id: 323, name: 'african', value: 3, category: 'CUISINE' }, //ai
  { id: 324, name: 'brazilian', value: 3, category: 'CUISINE' }, //ai
  { id: 325, name: 'russian', value: 3, category: 'CUISINE' }, //ai

] as const;


export function getTagDescriptor(tag_id: number, recipe: RecipeProcessed) {
  const tag = TAGS.find(tag => tag.id === tag_id);
  if(!tag) return null;

  if (tag.name === 'budget') {
    return {
      descriptor: `${formatMoney(recipe.price ?? 0)} per serving`,
      background: 'golden-gradient-muted',
    };
  }
  else if (tag.name === 'few ingredients') {
    return {
      descriptor: `few ingredients`,
      background: 'metallic-gradient-simple',
    };
  }
  else if (tag.name === 'high protein') {
    return {
      descriptor: `${recipe.protein.toFixed(0)}g protein per serving`,
      background: 'golden-gradient-muted',
    };
  }
  else if (tag.name === 'low carb') {
    return {
      descriptor: `${recipe.carbohydrates.toFixed(0)}g carbs per serving`,
      background: 'metallic-gradient-simple',
    };
  }
  else if (tag.name === 'low fat') {
    return {
      descriptor: `${recipe.fat.toFixed(0)}g fat per serving`,
      background: 'metallic-gradient-simple',
    };
  }
  else if (tag.name === 'high fiber') {
    return {
      descriptor: `${recipe.fiber.toFixed(0)}g fiber per serving`,
      background: 'golden-gradient-muted',
    };
  }
  else if (tag.name === 'low calorie') {
    return {
      descriptor: `${recipe.kcal.toFixed(0)}kcal per serving`,
      background: 'golden-gradient-muted',
    }
}
return {
  descriptor: tag.name,
  background: 'metallic-gradient-simple',
}
}
