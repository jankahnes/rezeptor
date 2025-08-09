import { getFoods } from "~/utils/db/getters/getFoods";
import type { SupabaseClient } from "@supabase/supabase-js";

type JsonUploadRecipe = {
    title: string;
    ingredients: {
        id: number|null;
        name: string|null;
        amount: number;
        unit: string;
        category: string|null;
        preperation_description: string|null;
    }[];
    instructions: string;
    serves: number;
    rating: number|null;
    description: string|null;
    image_url: string|null;
}


export default async function convertJsonToEditable(recipe: JsonUploadRecipe, supabase: SupabaseClient) {
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
        const foodsFromDb = await getFoods(supabase, { in: { id: ingredientIds } });
        for (const ingredient of recipe.ingredients) {
          const matchingFood = foodsFromDb.find(
            (food) => food.id === ingredient.id
          );
          const mergedIngredient = {
            ...matchingFood,
            ...ingredient,
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