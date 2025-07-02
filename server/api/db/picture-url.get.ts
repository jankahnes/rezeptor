import { getImageUrl } from '~/utils/db/getters/getImageUrl'
import type { GetterOpts } from '~/types/exports'
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const client = await serverSupabaseClient(event);
  return await getImageUrl(client, query.bucket as string, query.id as string, query.ext as string);
});