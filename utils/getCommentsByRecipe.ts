type Comment = {
  id: number;
  created_at: string;
  user: { username: string; id: string; picture_url: string };
  content: string;
  recipe_id: number;
  rating: number;
  replying_to?: number;
  replies?: Comment[];
};

export default async function getCommentsByRecipe(
  recipe_id: number
): Promise<Comment[]> {

  console.log(recipe_id)
  const supabase = useSupabase();

  const { data: commentsData, error: commentsError } = await supabase
    .from('comments')
    .select(
      `
      id,
      created_at,
      content,
      recipe_id,
      replying_to,
      user:user_id (
      id,
      username,
      picture_url
    )
    `
    )
    .eq('recipe_id', recipe_id);

  if (commentsError) {
    throw new Error('Error fetching comments: ' + commentsError.message);
  }

  if (!commentsData) {
    return [];
  }

  const userIds = commentsData.map((c) => c.user.id);

  const { data: ratingsData, error: ratingsError } = await supabase
    .from('ratings')
    .select('user_id, rating')
    .eq('recipe_id', recipe_id)
    .in('user_id', userIds);

  if (ratingsError) {
    throw new Error('Error fetching ratings: ' + ratingsError.message);
  }

  const ratingMap: Record<string, number> = {};
  ratingsData?.forEach((r) => {
    ratingMap[r.user_id] = r.rating;
  });

  const commentMap: Record<number, Comment> = {};

  commentsData.forEach((comment) => {
    comment.replies = [];
    comment.rating = ratingMap[comment.user.id] ?? null;
    commentMap[comment.id] = comment;
  });

  const rootComments: Comment[] = [];

  commentsData.forEach((comment) => {
    if (comment.replying_to) {
      const parent = commentMap[comment.replying_to];
      if (parent) {
        comment.parent = parent;
        parent.replies!.push(comment);
      }
    } else {
      rootComments.push(comment);
    }
  });

  return rootComments;
}
