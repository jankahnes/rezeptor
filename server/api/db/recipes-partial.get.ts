import { getRecipesPartial } from '~/utils/db/getters/getRecipes'
import type { GetterOpts } from '~/types/exports'
import { serverSupabaseClient } from '#supabase/server'
import parseJsonParams from '~/utils/format/parseJSONParams';

export default defineEventHandler(async (event) => {
  const query = parseJsonParams(getQuery(event));
  const client = await serverSupabaseClient(event);
  return await getRecipesPartial(client, query as GetterOpts);
});