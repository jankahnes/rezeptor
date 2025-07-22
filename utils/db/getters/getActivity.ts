import type { SupabaseClient } from '@supabase/supabase-js';
import buildQuery from '~/utils/db/getters/buildQuery';
import type { GetterOpts } from '~/types/exports';

export async function getActivity(
  client: SupabaseClient,
  opts: GetterOpts = {}
) {
  let query = client.from('activity').select(
    `
      *,
      user: user_id ( username, picture ),
      comment: comment_id (
        content,
        recipe: recipe_id (
          title,
          id
        )
      ),
      recipe: recipe_id (
        title,
        id
      ),
      rating: rating_id (
        rating,
        recipe: recipe_id (
          title,
          id,
          picture
        )
      ),
      food: food_id (
        name
      )
    `
  );
  query = buildQuery(query, opts);
  const { data, error } = await query;
  if (error) throw error;
  return data as ActivityProcessed[];
}
