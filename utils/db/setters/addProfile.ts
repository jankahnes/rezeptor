import type { SupabaseClient } from '@supabase/supabase-js';

export default async function addProfile(
  client: SupabaseClient,
  profileRow: any,
  preferredTags: number[],
  preferredFoods: number[]
) {
  const { data, error } = await client.from('profiles').update(profileRow).eq('id', profileRow.id);
  if (error) throw error;

  const { data: preferredFoodsData, error: preferredFoodsError } = await client
      .from('preferred_foods')
      .insert(
        preferredFoods.map((food) => ({
          user_id: profileRow.id,
          food_name_id: food,
        }))
      );
    const { data: preferredTagsData, error: preferredTagsError } = await client
      .from('preferred_tags')
      .insert(
        preferredTags.map((tag) => ({ user_id: profileRow.id, tag_id: tag }))
      );

  if (preferredFoodsError || preferredTagsError) throw preferredFoodsError || preferredTagsError;

  return { data, preferredFoodsData, preferredTagsData };
}
