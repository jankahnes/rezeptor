type FeedItem = {
  id: number;
  created_at: string;
  type:
    | 'COMMENT_CREATION'
    | 'RECIPE_CREATION'
    | 'RATING_CREATION'
    | 'USER_CREATION'
    | 'FOOD_CREATION';
  user_id: number | null;
  username: string | null;
  title?: string;
  content?: string;
  rating?: number;
  name?: string;
  recipe_id?: number;
  food_id?: number;
};

export async function getFeedItems(limit = 20): Promise<FeedItem[]> {
  const client = useSupabase();
  const { data, error } = await client
    .from('activity')
    .select(
      `
      id,
      created_at,
      type,
      user_id,
      users: user_id ( username ),
      comment_id (
        content,
        recipe_id (
          title,
          id
        )
      ),
      recipe_id (
        title,
        id
      ),
      rating_id (
        rating,
        recipe_id (
          title,
          id
        )
      ),
      food_id (
        name
      )
    `
    )
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Failed to fetch feed items:', error);
    return [];
  }
  console.log(JSON.parse(JSON.stringify(data)));

  return (data || []).map((row): FeedItem => {
    const base = {
      id: row.id,
      created_at: row.created_at,
      type: row.type,
      user_id: row.user_id,
      username: row.users?.username ?? null,
    };

    switch (row.type) {
      case 'COMMENT_CREATION':
        return {
          ...base,
          content: row.comment_id?.content ?? '',
          title: row.comment_id?.recipe_id?.title ?? '',
          recipe_id: row.comment_id?.recipe_id?.id ?? null,
        };
      case 'RECIPE_CREATION':
        return {
          ...base,
          title: row.recipe_id?.title ?? '',
          recipe_id: row?.recipe_id?.id ?? null,
        };
      case 'RATING_CREATION':
        return {
          ...base,
          rating: row.rating_id?.rating ?? null,
          title: row.rating_id?.recipe_id?.title ?? '',
          recipe_id: row.rating_id?.recipe_id?.id ?? null,
        };
      case 'FOOD_CREATION':
        return {
          ...base,
          name: row.food_id?.name ?? '',
          food_id: row.food_id ?? null,
        };
      case 'USER_CREATION':
      default:
        return base;
    }
  });
}
