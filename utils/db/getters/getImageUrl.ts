import type { SupabaseClient } from '@supabase/supabase-js';

export async function getImageUrl(
  client: SupabaseClient,
  bucket: string,
  id: string | number,
  ext: string | null
) {
  if (!ext) return null;
  const { data } = await client.storage
    .from(bucket)
    .getPublicUrl(`${id}.${ext}`);
  return data.publicUrl;
}
