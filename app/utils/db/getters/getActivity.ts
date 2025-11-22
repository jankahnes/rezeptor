import type { SupabaseClient } from '@supabase/supabase-js';

export async function getActivity(
  client: SupabaseClient,
  opts: GetterOpts = {}
): Promise<Activity[]> {
  let query = client.from('activity').select(
    `
      *,
      user: user_id ( username, picture, id ),
      comment: comment_id (
        content,
        recipe: recipe_id (
          title,
          id
        )
      ),
      recipe: recipe_id (
        title,
        id,
        picture
      ),
      rating: rating_id (
        rating,
        recipe: recipe_id (
          title,
          id,
          picture
        )
      ),
      food: food_name_id ( name )
    `
  );
  query = buildQuery(query, opts);
  const { data, error } = await query;
  if (error) throw error;
  return data as Activity[];
}
