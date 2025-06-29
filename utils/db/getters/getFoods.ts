export async function getFoods(opts: GetterOpts = {}) {
  const client = useSupabase();
  let query = client.from('foods').select(`*`);
  query = buildQuery(query, opts);
  const { data, error } = await query;
  if (error) throw error;
  return data as Food[];
}

export async function getFood(opts: GetterOpts = {}) {
  return expectSingle(await getFoods(opts));
}
