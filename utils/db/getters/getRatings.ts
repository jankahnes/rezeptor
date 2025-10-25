import type { SupabaseClient } from '@supabase/supabase-js';
import { expectSingle } from '~/utils/db/getters/expectSingle';
import type { Rating } from '~/types/types';
import buildQuery from '~/utils/db/getters/buildQuery';

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
