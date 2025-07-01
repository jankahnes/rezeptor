export async function getRatings(opts: GetterOpts = {}) {
  let query = useSupabase().from('ratings').select('*');
  query = buildQuery(query, opts);
  const { data, error } = await query;
  if (error) throw error;
  return data as Rating[];
}
