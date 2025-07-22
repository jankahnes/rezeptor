import { SupabaseClient } from '@supabase/supabase-js';

export default async function uploadImage(
  client: SupabaseClient,
  bucket: string,
  id: string,
  file: File,
  isUpdate = false
) {
  if (!file) return;

  const fileExt = file.name.split('.').pop();
  const fileName = `${id}.${fileExt}`;

  const { error } = await client.storage.from(bucket).upload(fileName, file, {
    cacheControl: '3600',
    upsert: isUpdate,
  });

  if (error) {
    console.error('Upload error:', error.message);
  }

  const { data } = client.storage.from(bucket).getPublicUrl(fileName);
  return data.publicUrl;
}
