export async function getActivity(opts: GetterOpts = {}) {
  const client = useSupabase();
  let query = client.from('activity').select(
    `
      *,
      user: user_id ( username, picture_ext ),
      comment: comment_id (
        content,
        recipe: recipe_id (
          title,
          id
        )
      ),
      recipe: recipe_id (
        title,
        id
      ),
      rating: rating_id (
        rating,
        recipe: recipe_id (
          title,
          id
        )
      ),
      food: food_id (
        name
      )
    `
  );
  query = buildQuery(query, opts);
  const { data, error } = await query;
  if (error) throw error;

  const userPictureCache = new Map<string, string>();
  const promises = data.map(async (item) => {
    const cacheKey = `${item.user_id}-${item.user.picture_ext}`;

    if (!userPictureCache.has(cacheKey) && item.user.picture_ext) {
      const pictureUrl = await getImageUrl(
        'profile',
        item.user_id,
        item.user.picture_ext
      );
      userPictureCache.set(cacheKey, pictureUrl);
    }

    item.user.picture_url = userPictureCache.get(cacheKey) || null;
  });

  await Promise.all(promises);
  return data as ActivityProcessed[];
}
