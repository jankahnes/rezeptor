import type { SupabaseClient } from '@supabase/supabase-js';

export default async function addProfile(
  client: SupabaseClient,
  profileRow: any,
  preferredTags: number[],
  preferredFoods: number[]
) {
  await client.from('profiles').insert(profileRow);
  await Promise.all([
    client
      .from('preferred_foods')
      .insert(
        preferredFoods.map((food) => ({
          user_id: profileRow.id,
          food_id: food,
        }))
      ),
    client
      .from('preferred_tags')
      .insert(
        preferredTags.map((tag) => ({ user_id: profileRow.id, tag_id: tag }))
      ),
  ]);
}
