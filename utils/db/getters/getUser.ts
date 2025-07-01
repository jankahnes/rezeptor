export async function getUsers(opts: GetterOpts = {}) {
  const client = useSupabase();
  if (!client) {
    return {};
  }
  let query = client.from('profiles').select(`*`);
  query = buildQuery(query, opts);
  const { data, error } = await query;
  if (error) throw error;
  const users = data as UserProcessed[];
  const ids = users.map((user) => user.id);
  const ownRecipes = await getRecipesPartial({ in: { user_id: ids } });
  const activity = await getActivity({
    in: { user_id: ids },
    orderBy: { column: 'created_at', ascending: false },
  });
  const likes = await getRecipesPartial({ in: { user_id: ids } });
  const stats = {
    recipesCount: ownRecipes.length,
    activityCount: activity.length,
    likesCount: likes.length,
  };

  const processedUsers = await Promise.all(
    users.map(async (user) => ({
      ...user,
      recipes: ownRecipes.filter((recipe) => recipe.user_id === user.id),
      activity: activity.filter((item) => item.user_id === user.id),
      likes: likes.filter((recipe) => recipe.user_id === user.id),
      picture_url: await getImageUrl('profile', user.id, user.picture_ext),
      settings: user.settings as Record<string, any>,
      stats,
    }))
  );

  return processedUsers;
}

export async function getUsersPartial(opts: GetterOpts = {}) {
  const client = useSupabase();
  let query = client.from('profiles').select(`*`);
  query = buildQuery(query, opts);
  const { data, error } = await query;
  if (error) throw error;
  const users = await Promise.all(
    data.map(async (user) => ({
      ...user,
      picture_url: await getImageUrl('profile', user.id, user.picture_ext),
    }))
  );
  return users as UserProcessed[];
}

export async function getUser(opts: GetterOpts = {}) {
  return expectSingle(await getUsers(opts));
}

export async function getUserPartial(opts: GetterOpts = {}) {
  return expectSingle(await getUsersPartial(opts));
}
