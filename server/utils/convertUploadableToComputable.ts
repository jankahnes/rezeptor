import { getFoodNames } from '~/utils/db/getters/getFoods';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  unitStyling,
  preparationDescriptionStyling,
  unitToDBMap,
  amountStyling,
  ingredientStyling,
} from '~/utils/format/parseIngredientString';
import pluralizeWord from '~/utils/format/pluralizeWord';
import isCountable from '~/utils/format/isCountable';
import type {
  ComputableRecipe,
  FullIngredient,
  UploadableRecipe,
  ParsedPart,
  Recipe,
} from '~/types/types';

function convertUnitToDB(unit: string) {
  if (unitToDBMap[unit as keyof typeof unitToDBMap]) {
    return unitToDBMap[unit as keyof typeof unitToDBMap];
  } else {
    return unit;
  }
}

function addParsed(ingredient: FullIngredient) {
  let unitName = ingredient.unit.toLowerCase();
  if (
    isCountable(ingredient.unit) &&
    ingredient.amount != 1 &&
    ingredient.unit
  ) {
    unitName = pluralizeWord(unitName);
  }
  const parsed = [
    {
      text: ingredient.amount.toString(),
      styling: amountStyling,
    },
    {
      text: ingredient.name,
      styling: ingredientStyling,
    },
  ];
  if (unitName != '') {
    parsed.splice(1, 0, {
      text: unitName,
      styling: unitStyling,
    });
  }

  ingredient.parsed = parsed satisfies ParsedPart[];
  ingredient.rawText =
    ingredient.amount + ' ' + unitName + ' ' + ingredient.name;

  if (ingredient.preparation_description) {
    parsed.push({
      text: ingredient.preparation_description,
      styling: preparationDescriptionStyling,
    });
    ingredient.rawText += ', ' + ingredient.preparation_description;
  }
}

export default async function convertUploadableToComputable(
  recipe: UploadableRecipe | Recipe,
  supabase: SupabaseClient,
  parse: boolean = false
): Promise<ComputableRecipe> {
  if (!recipe || !supabase) {
    throw new Error('Recipe and supabase are required');
  }
  for (const ingredient of recipe.ingredients) {
    if (!ingredient.category) {
      ingredient.category = 'uncategorized';
    }
  }
  const fullIngredients: FullIngredient[] = [];
  const ingredientIds = recipe.ingredients.map((ingredient: { id: number }) => ingredient.id);
  const foodsFromDb = await getFoodNames(supabase, {
    in: { id: ingredientIds },
  });
  for (const ingredient of recipe.ingredients) {
    const matchingFood = foodsFromDb.find((food) => food.id === ingredient.id);
    if (!matchingFood) {
      throw new Error(
        'Matching food not found for ingredient: ' + ingredient.id
      );
    }
    const mergedIngredient: FullIngredient = {
      ...matchingFood,
      ...matchingFood.food,
      ...ingredient,
      name: matchingFood.name,
      unit: convertUnitToDB(ingredient.unit),
    };
    if (parse) {
      addParsed(mergedIngredient);
    }
    fullIngredients.push(mergedIngredient);
  }
  return {
    serves: 1,
    publish: false,
    ...recipe,
    fullIngredients: fullIngredients,
  };
}
