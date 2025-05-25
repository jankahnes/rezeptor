type Record = {
  rating: number;
  comment: string;
};

export default async function getRecordByUser(
  recipe_id: number,
  user_id: string
): Promise<Record> {
  const supabase = useSupabase();

  const { data: commentData, error: commentsError } = await supabase
    .from('comments')
    .select('content')
    .eq('recipe_id', recipe_id)
    .eq('user_id', user_id)
    .is('replying_to', null);

  if (commentsError) {
    throw new Error('Error fetching comments: ' + commentsError.message);
  }

  const { data: ratingData, error: ratingsError } = await supabase
    .from('ratings')
    .select('rating')
    .eq('recipe_id', recipe_id)
    .eq('user_id', user_id);

  if (ratingsError) {
    throw new Error('Error fetching ratings: ' + ratingsError.message);
  }

  return {
    comment: commentData?.[0]?.content ?? null,
    rating: ratingData?.[0]?.rating ?? null,
  };
}
