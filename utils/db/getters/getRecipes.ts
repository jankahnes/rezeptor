import type { SupabaseClient } from '@supabase/supabase-js';
import type { Comment } from '~/types/types';

function getTagCategory(tagId: number): string {
  if (tagId >= 300) return 'CUISINE';
  if (tagId >= 200) return 'TYPE';
  if (tagId >= 100) return 'DIET';
  return 'GENERAL';
}

async function getRecipeIdsByTags(
  tags: number[],
  client: SupabaseClient<Database>
): Promise<number[]> {
  // Group tags by category
  const tagsByCategory: Record<string, number[]> = {};
  tags.forEach((tagId) => {
    const category = getTagCategory(tagId);
    if (!tagsByCategory[category]) {
      tagsByCategory[category] = [];
    }
    tagsByCategory[category].push(tagId);
  });

  // For each category, find recipe IDs that have ANY of those tags (OR)
  const recipeIdSets: Set<number>[] = [];

  for (const [category, tagIds] of Object.entries(tagsByCategory)) {
    const { data } = await client
      .from('recipe_tags')
      .select('recipe_id')
      .in('tag_id', tagIds);

    if (data) {
      const recipeIds = new Set(data.map((r) => r.recipe_id));
      recipeIdSets.push(recipeIds);
    }
  }

  // Intersect all sets (AND across categories)
  if (recipeIdSets.length > 0) {
    let matchingRecipeIds = recipeIdSets[0];
    for (let i = 1; i < recipeIdSets.length; i++) {
      matchingRecipeIds = new Set(
        [...matchingRecipeIds].filter((id) => recipeIdSets[i].has(id))
      );
    }
    return Array.from(matchingRecipeIds);
  }

  return [];
}

export async function getRecipes(
  client: SupabaseClient<Database>,
  opts: GetterOpts = {}
): Promise<Recipe[]> {
  let query = client.from('recipes').select(`
        *,
        tags:recipe_tags(tag_id),
        ingredients:recipe_foods(
          amount,
          unit,
          food_name:food_names(
            id,
            name,
            food:foods(
              id, density, countable_units, price, aisle
            )
          ),
          category,
          preparation_description,
          consumption_factor,
          thermal_intensity,
          heat_medium,
          mechanical_disruption,
          thermal_description,
          mechanical_description
        ),
        comments:comments(*,
          user:profiles(id, username, picture)
        ),
        user:profiles(id, username, picture)
      `);

  query = buildQuery(query, opts);

  const { data, error } = await query;
  const recipes = data as any;
  if (error) throw error;
  for (const recipe of recipes) {
    recipe.tags = recipe.tags.map((t: { tag_id: number }) => t.tag_id);
  }
  if (recipes.length === 0) return [];

  const userIds = recipes.flatMap((r: Recipe) =>
    r.comments.map((c: { user_id: string }) => c.user_id)
  );
  const recipeIds = recipes.map((r: Recipe) => r.id);
  const ratings = await getRatings(client, {
    in: { user_id: userIds, recipe_id: recipeIds },
  });

  for (const recipe of recipes) {
    for (const c of recipe.comments) {
      const match = ratings.find(
        (r) => r.user_id === c.user_id && r.recipe_id === recipe.id
      );
      c.rating = match?.rating ?? null;
    }

    const map: Record<number, Comment> = {};
    recipe.comments.forEach((c: Comment) => {
      c.replies = [];
      map[c.id!] = c;
    });
    const roots: Comment[] = [];
    recipe.comments.forEach((c: Comment) => {
      if (c.replying_to && map[c.replying_to]) {
        map[c.replying_to].replies!.push(c);
      } else {
        roots.push(c);
      }
    });
    recipe.comments = roots;
    recipe.processing_requirements =
      recipe.processing_requirements as ProcessingRequirement;

    recipe.ingredients = recipe.ingredients.map((ingredient: any) => {
      return {
        id: ingredient.food_name.id,
        name: ingredient.food_name.name,
        category: ingredient.category,
        amount: ingredient.amount,
        unit: ingredient.unit,
        countable_units: ingredient.food_name.food.countable_units,
        amountInfo: [[ingredient.amount, ingredient.unit]],
        currentUnit: 0,
        density: ingredient.food_name.food.density,
        aisle: ingredient.food_name.food.aisle,
        price: ingredient.food_name.food.price,
        preparation_description: ingredient.preparation_description,
        consumption_factor: ingredient.consumption_factor,
        thermal_intensity: ingredient.thermal_intensity,
        heat_medium: ingredient.heat_medium,
        mechanical_disruption: ingredient.mechanical_disruption,
        thermal_description: ingredient.thermal_description,
        mechanical_description: ingredient.mechanical_description,
      } as Ingredient;
    });
    recipe.ingredients.forEach(fillForUnits);
  }
  return recipes as Recipe[];
}

export async function getRecipe(
  client: SupabaseClient,
  opts: GetterOpts = {}
): Promise<Recipe> {
  return expectSingle(await getRecipes(client, opts));
}

export async function getRecipeOverviews(
  client: SupabaseClient,
  opts: GetterOpts = {}
): Promise<RecipeOverview[]> {
  let query = client.from('recipes').select(`
        id, hidx, kcal, price, title, created_at, visibility, picture, rating, protein, carbohydrates, fat, sugar, salt, fiber, user_id, collection, 
        tags:recipe_tags(tag_id)
      `);
  if (
    opts.trigram_search &&
    opts.trigram_search.query &&
    opts.trigram_search.query.trim() !== ''
  ) {
    const { data: trigramResults, error: trigramError } = await client.rpc(
      'search_recipes',
      {
        query: opts.trigram_search.query,
        max: opts.limit || 50,
      }
    );

    if (trigramError) throw trigramError;

    if (!trigramResults || trigramResults.length === 0) {
      return [];
    }

    const recipeIds = trigramResults.map((result: any) => result.id);

    query = query.in('id', recipeIds);
  }

  if (opts.filtering?.tags && opts.filtering.tags.length > 0) {
    const recipeIds = await getRecipeIdsByTags(opts.filtering.tags, client);
    if (recipeIds.length > 0) {
      query = query.in('id', recipeIds);
    } else {
      query = query.in('id', []);
    }
  }

  if (opts.filtering) {
    query = buildQueryFromRecipeFiltering(query, opts.filtering);
  }
  query = buildQuery(query, opts);

  const { data, error } = await query;
  if (error) throw error;

  for (const recipe of data) {
    (recipe as any).tags = recipe.tags.map((t: { tag_id: number }) => t.tag_id);
  }

  return data as unknown as RecipeOverview[];
}

export async function getRecipeOverview(
  client: SupabaseClient,
  opts: GetterOpts = {}
): Promise<RecipeOverview> {
  return expectSingle(await getRecipeOverviews(client, opts));
}
