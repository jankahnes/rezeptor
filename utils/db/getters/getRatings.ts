import type { SupabaseClient } from '@supabase/supabase-js';
import buildQuery from '~/utils/db/getters/buildQuery';
import type { GetterOpts } from '~/types/exports';

export async function getRatings(
  client: SupabaseClient,
  opts: GetterOpts = {}
) {
  let query = client.from('ratings').select('*');
  query = buildQuery(query, opts);
  const { data, error } = await query;
  if (error) throw error;
  return data as Rating[];
}

export async function getRating(
  client: SupabaseClient,
  opts: GetterOpts = {}
) {
  return expectSingle(await getRatings(client, opts));
}