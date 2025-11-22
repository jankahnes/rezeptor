import type { SupabaseClient } from '@supabase/supabase-js';

export async function getCount(
  client: SupabaseClient<Database>,
  opts: GetterOpts = {}
): Promise<number> {
  let query = client.from('recipes').select('*', {
    count: 'exact',
    head: true,
  });

  if (opts.filtering?.tags && opts.filtering.tags.length > 0) {
    // Handle tag filtering separately to get recipe IDs first
    const recipeIds = await getRecipeIdsByTagsForCount(
      opts.filtering.tags,
      client
    );
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

  const { count, error } = await query;
  if (error) throw error;

  return count ?? 0;
}

function getTagCategory(tagId: number): string {
  if (tagId >= 300) return 'CUISINE';
  if (tagId >= 200) return 'TYPE';
  if (tagId >= 100) return 'DIET';
  return 'GENERAL';
}

async function getRecipeIdsByTagsForCount(
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
