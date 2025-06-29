export async function getUser(id: string) {
  const supabase = useSupabase();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id);
  if (error) throw error;
  return data[0];
}
