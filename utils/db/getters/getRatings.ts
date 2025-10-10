import type { SupabaseClient } from '@supabase/supabase-js';

export async function getRatings(
  client: SupabaseClient,
  opts: GetterOpts = {}
): Promise<Rating[]> {
  let query = client.from('ratings').select('*');
  query = buildQuery(query, opts);
  const { data, error } = await query;
  if (error) throw error;
  return data as Rating[];
}

export async function getRating(
  client: SupabaseClient,
  opts: GetterOpts = {}
): Promise<Rating> {
  return expectSingle(await getRatings(client, opts));
}
