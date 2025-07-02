import { getUsers } from '~/utils/db/getters/getUser'
import type { GetterOpts } from '~/types/exports'
import { serverSupabaseClient } from '#supabase/server'
import parseJsonParams from '~/utils/format/parseJSONParams';

export default defineEventHandler(async (event) => {
  const query = parseJsonParams(getQuery(event));
  const client = await serverSupabaseClient(event);
  return await getUsers(client, query as GetterOpts);
});