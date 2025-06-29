export async function getRatings(opts: GetterOpts = {}) {
  let query = useSupabase().from('ratings').select('user_id, rating');
  query = buildQuery(query, opts);
  const { data, error } = await query;
  if (error) throw error;
  return data as { user_id: string; rating: number }[];
}
