export async function getRecipes(
  opts: GetterOpts = {}
): Promise<RecipeProcessed[]> {
  const client = useSupabase();

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
        comments:comments(
          *,
          user:user_id(
            id,
            username,
            picture_url
          )
        )
      `);

  query = buildQuery(query, opts);

  const { data, error } = await query;
  if (error) throw error;
  const recipes = data.map((recipe) => ({
    ...recipe,
    tags: recipe.tag_objs.map((t) => t.tag_id),
  })) as RecipeProcessed[];
  if (recipes.length === 0) return [];

  const userIds = recipes.flatMap((r) => r.comments.map((c) => c.user.id));
  const recipeIds = recipes.map((r) => r.id);
  const ratings = await getRatings({
    in: { user_id: userIds, recipe_id: recipeIds },
  });

  recipes.forEach(async (recipe) => {
    if (recipe.picture_ext) {
      recipe.picture_url = await getImageUrl(
        'recipe',
        recipe.id,
        recipe.picture_ext
      );
    }
    recipe.comments.forEach((c) => {
      const match = ratings.find(
        (r) => r.user_id === c.user.id && r.recipe_id === recipe.id
      );
      c.rating = match?.rating ?? null;
    });

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
  });

  return recipes;
}

export async function getRecipe(opts: GetterOpts = {}) {
  return expectSingle(await getRecipes(opts));
}

export async function getRecipesPartial(opts: GetterOpts = {}) {
  const client = useSupabase();

  let query = client.from('recipes').select(`
        *,
        tags:recipe_tags(tag_id)
      `);

  query = buildQuery(query, opts);

  const { data, error } = await query;
  if (error) throw error;

  const recipes = data as RecipeProcessed[];
  if (recipes.length === 0) return [];
  recipes.forEach(async (recipe) => {
    if (recipe.picture_ext) {
      recipe.picture_url = await getImageUrl(
        'recipe',
        recipe.id,
        recipe.picture_ext
      );
    }
  });
  return recipes;
}
