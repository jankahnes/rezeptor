import type { SupabaseClient } from '@supabase/supabase-js';
import { expectSingle } from '~/utils/db/getters/expectSingle';
import buildQuery from '~/utils/db/getters/buildQuery';
import type { GetterOpts } from '~/types/exports';

export async function getFoods(
  client: SupabaseClient,
  opts: GetterOpts = {}
) {
  let query = client.from('foods').select(`*`);
  query = buildQuery(query, opts);
  const { data, error } = await query;
  if (error) throw error;
  return data as Food[];
}

export async function getFood(opts: GetterOpts = {}) {
  return expectSingle(await getFoods(opts));
}
