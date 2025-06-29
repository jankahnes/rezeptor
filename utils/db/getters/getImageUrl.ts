export async function getImageUrl(bucket: string, id: number, ext: string) {
  const supabase = useSupabase();
  const { data } = await supabase.storage
    .from(bucket)
    .getPublicUrl(`${id}.${ext}`);
  return data.publicUrl;
}