export default async function getRecipesByUser(user_id: number, limit = 10) {
  const supabase = useSupabase();
  const { data, error } = await supabase
    .from('recipes')
    .select(
      `
    *,
    recipe_tags!inner (
      tag_id,
      tags ( id, name )
    )
  `
    )
    .eq('user_id', user_id)
    .limit(limit);
  if (error) {
    throw new Error(String(error));
  }
  return data;
}
