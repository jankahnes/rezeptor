import type { SupabaseClient } from '@supabase/supabase-js';

export default async function upsertRating(
  supabase: SupabaseClient,
  rating: number,
  userId: string,
  recipeId: number
) {
  if (!userId) {
    throw new Error("Can't create a rating without being logged in.");
  }
  if (rating < 0 || rating > 5) {
    throw new Error('Rating has to be between 0 and 5.');
  }

  // Use upsert with conflict target to ensure (user_id, recipe_id) is used as the unique key
  const { error } = await supabase.from('ratings').upsert(
    {
      user_id: userId,
      recipe_id: recipeId,
      rating: rating,
    },
    { onConflict: 'user_id,recipe_id' }
  );

  if (error) {
    throw new Error('Failed to update rating: ' + error.message);
  }
}
