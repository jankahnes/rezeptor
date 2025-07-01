export async function getImageUrl(
  bucket: string,
  id: string | number,
  ext: string | null
) {
  const supabase = useSupabase();
  const { data } = await supabase.storage
    .from(bucket)
    .getPublicUrl(`${id}.${ext}`);
  return data.publicUrl;
}
