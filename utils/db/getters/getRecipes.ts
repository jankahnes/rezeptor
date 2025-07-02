import type { SupabaseClient } from '@supabase/supabase-js';
import { expectSingle } from '~/utils/db/getters/expectSingle';
import { getRatings } from '~/utils/db/getters/getRatings';
import { getImageUrl } from '~/utils/db/getters/getImageUrl';
import { getUserPartial } from '~/utils/db/getters/getUser';
import buildQuery from '~/utils/db/getters/buildQuery';
import type { GetterOpts } from '~/types/exports';
import getPossibleUnits from '~/utils/format/getPossibleUnits';
import fillForUnits from '~/utils/format/fillForUnits';

export async function getRecipes(
  client: SupabaseClient,
  opts: GetterOpts = {}
): Promise<RecipeProcessed[]> {
  let query = client.from('recipes').select(`
        *,
        tag_objs:recipe_tags(tag_id),
        ingredients:recipe_foods(
          amount,
          unit,
          food:foods(
            id, name, price, density, unit_weight, unit_name, measurements
          ),
          category
        ),
        comments:comments(*)
      `);

  query = buildQuery(query, opts);

  const { data, error } = await query;
  if (error) throw error;
  const recipes = data.map((recipe) => ({
    ...recipe,
    tags: recipe.tag_objs.map((t) => t.tag_id),
  })) as RecipeProcessed[];
  if (recipes.length === 0) return [];

  const userIds = recipes.flatMap((r) => r.comments.map((c) => c.user_id));
  const recipeIds = recipes.map((r) => r.id);
  const ratings = await getRatings(client, {
    in: { user_id: userIds, recipe_id: recipeIds },
  });

  for (const recipe of recipes) {
    if (recipe.picture_ext) {
      recipe.picture_url = await getImageUrl(
        client,
        'recipe',
        recipe.id,
        recipe.picture_ext
      );
    }
    for (const c of recipe.comments) {
      const match = ratings.find(
        (r) => r.user_id === c.user_id && r.recipe_id === recipe.id
      );
      c.rating = match?.rating ?? null;
      c.user = await getUserPartial(client, { eq: { id: c.user_id } });
    }

    const map: Record<number, CommentProcessed> = {};
    recipe.comments.forEach((c) => {
      c.replies = [];
      map[c.id] = c;
    });
    const roots: CommentProcessed[] = [];
    recipe.comments.forEach((c) => {
      if (c.replying_to && map[c.replying_to]) {
        map[c.replying_to].replies!.push(c);
      } else {
        roots.push(c);
      }
    });
    recipe.comments = roots;

    recipe.ingredients = recipe.ingredients.map((ingredient) => {
      return {
        id: ingredient.food.id,
        name: ingredient.food.name,
        price: ingredient.food.price,
        density: ingredient.food.density,
        unit_weight: ingredient.food.unit_weight,
        unit_name: ingredient.food.unit_name,
        measurements: Array.isArray(ingredient.food.measurements)
          ? ingredient.food.measurements
          : [],
        category: ingredient.category,
        amountInfo: [[ingredient.amount, ingredient.unit]],
        possibleUnits: getPossibleUnits(
          Array.isArray(ingredient.food.measurements)
            ? ingredient.food.measurements
            : []
        ),
        currentUnit: 0,
      };
    });
    recipe.ingredients.forEach(fillForUnits);
  }

  return recipes;
}

export async function getRecipe(client: SupabaseClient, opts: GetterOpts = {}) {
  return expectSingle(await getRecipes(client, opts));
}

export async function getRecipesPartial(
  client: SupabaseClient,
  opts: GetterOpts = {}
) {
  let query = client.from('recipes').select(`
        *,
        tags:recipe_tags(tag_id)
      `);

  query = buildQuery(query, opts);

  const { data, error } = await query;
  if (error) throw error;

  const recipes = data as RecipeProcessed[];
  if (recipes.length === 0) return [];

  for (const recipe of recipes) {
    if (recipe.picture_ext) {
      recipe.picture_url = await getImageUrl(
        client,
        'recipe',
        recipe.id,
        recipe.picture_ext
      );
    }
  }
  return recipes;
}
