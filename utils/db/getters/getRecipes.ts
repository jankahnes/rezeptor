import type { SupabaseClient } from '@supabase/supabase-js';
import { expectSingle } from '~/utils/db/getters/expectSingle';
import { getRatings } from '~/utils/db/getters/getRatings';
import { getUserPartial } from '~/utils/db/getters/getUser';
import buildQuery from '~/utils/db/getters/buildQuery';
import buildQueryFromRecipeFiltering from '~/utils/db/getters/buildQueryFromRecipeFiltering';
import type { GetterOpts } from '~/types/exports';
import fillForUnits from '~/utils/format/fillForUnits';


//TODO all of this can be removed once satiety is filled in DB 
function scale_by_points(value: number, points: [number, number][]) {
  if (value <= points[0][0]) {
    return points[0][1];
  }
  if (value >= points[points.length - 1][0]) {
    return points[points.length - 1][1];
  }
  for (let i = 0; i < points.length - 1; i++) {
    const x1 = points[i][0];
    const y1 = points[i][1];
    const x2 = points[i + 1][0];
    const y2 = points[i + 1][1];
    if (x1 <= value && value <= x2) {
      return y1 + ((value - x1) * (y2 - y1)) / (x2 - x1);
    }
  }
  return 0;
}


function getED(kcal: number) {
  return scale_by_points(kcal, [
    [0, 100],
    [50, 90],
    [150, 70],
    [200, 50],
    [350, 30],
    [550, 0],
  ]);
}


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
          food_name:food_names(
            id,
            name,
            food:foods(
              id, price, density, measurements, countable_units
            )
          ),
          category,
          thermal_intensity,
          mechanical_disruption,
          heat_medium,
          thermal_description,
          mechanical_description,
          hydration_factor,
          preparation_description
        ),
        comments:comments(*),
        user:profiles(id, username, picture)
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
    if (!recipe.satiety) {
      recipe.satiety = 0.5 * getED(recipe.kcal ?? 0) + 0.5 * (recipe.sidx ?? 0);
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
        id: ingredient.food_name.id,
        name: ingredient.food_name.name,
        price: ingredient.food_name.food.price,
        density: ingredient.food_name.food.density,
        measurements: Array.isArray(ingredient.food_name.food.measurements)
          ? ingredient.food_name.food.measurements
          : [],
        category: ingredient.category,
        amountInfo: [[ingredient.amount, ingredient.unit]],
        currentUnit: 0,
        thermal_intensity: ingredient.thermal_intensity,
        mechanical_disruption: ingredient.mechanical_disruption,
        heat_medium: ingredient.heat_medium,
        thermal_description: ingredient.thermal_description,
        mechanical_description: ingredient.mechanical_description,
        hydration_factor: ingredient.hydration_factor,
        preparation_description: ingredient.preparation_description,
        countable_units: ingredient.food_name.food.countable_units,
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
  if (opts.filtering) {
    query = buildQueryFromRecipeFiltering(query, opts.filtering);
  }
  query = buildQuery(query, opts);

  const { data, error } = await query;
  if (error) throw error;

  return data as RecipeProcessed[];
}
