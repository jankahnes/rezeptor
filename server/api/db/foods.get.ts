import { getFoods } from '~/utils/db/getters/getFoods'
import type { GetterOpts } from '~/types/exports'
import { serverSupabaseClient } from '#supabase/server'
import parseJsonParams from '~/utils/format/parseJSONParams';

export default defineEventHandler(async (event) => {
  const query = parseJsonParams(getQuery(event));
  const client = await serverSupabaseClient(event);
  return await getFoods(client, query as GetterOpts);
});