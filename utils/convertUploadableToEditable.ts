import { getFoodNames } from "~/utils/db/getters/getFoods";
import type { SupabaseClient } from "@supabase/supabase-js";
import { unitToDBMap } from "~/utils/format/parseIngredientString";
import type { UploadableRecipeInformation } from "~/types/exports";

function convertUnitToDB(unit: string) {
  if(unitToDBMap[unit as keyof typeof unitToDBMap]) {
    return unitToDBMap[unit as keyof typeof unitToDBMap];
  }
  else {
    return "UNITS";
  }
}

export default async function convertUploadableToEditable(recipe: UploadableRecipeInformation, supabase: SupabaseClient) {
        if (!recipe) {
          return {};
        }
        for (const ingredient of recipe.ingredients) {
            if(!ingredient.category) {
                ingredient.category = 'uncategorized';
            }
        }

        recipe.ingredients_editable = { servingSize: recipe.serves, ingredients: [] };
        const ingredientIds = recipe.ingredients.map(
          (ingredient) => ingredient.id
        );
        const foodsFromDb = await getFoodNames(supabase, { in: { id: ingredientIds } });
        for (const ingredient of recipe.ingredients) {
          const matchingFood = foodsFromDb.find(
            (food) => food.id === ingredient.id
          );
          const mergedIngredient = {
            ...matchingFood.food,
            ...ingredient,
            name: matchingFood.name,
            unit: convertUnitToDB(ingredient.unit),
          };
          let foundCategory = recipe.ingredients_editable.ingredients.find(
            (category) => category.categoryName == ingredient.category
          );
          if (!foundCategory) {
            foundCategory = {
              categoryName: ingredient.category,
              searchQuery: null,
              searchResults: [],
              ingredients: [],
            };
            recipe.ingredients_editable.ingredients.push(foundCategory);
          }
          foundCategory.ingredients.push(mergedIngredient);
        }
        return recipe;
      }