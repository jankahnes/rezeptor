type Comment = {
  user_id: string;
  replying_to?: number;
  content: string;
  recipe_id: number;
};

export default async function (comment: Comment, checkForExisting: boolean) {
  if (!comment.user_id) {
    throw new Error("Can't create a comment without being logged in.");
  }

  const supabase = useSupabase();

  if (checkForExisting) {
    const { data: existing, error: fetchError } = await supabase
      .from('comments')
      .select('id')
      .eq('user_id', comment.user_id)
      .eq('recipe_id', comment.recipe_id)
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      throw new Error('Failed to check for existing comment: ' + fetchError.message);
    }

    if (existing) {
      const { error: updateError } = await supabase
        .from('comments')
        .update({ content: comment.content })
        .eq('id', existing.id);

      if (updateError) {
        throw new Error('Failed to update existing comment: ' + updateError.message);
      }

      return existing.id;
    }
  }

  const { data, error } = await supabase
    .from('comments')
    .insert({
      user_id: comment.user_id,
      replying_to: comment.replying_to ?? null,
      content: comment.content,
      recipe_id: comment.recipe_id,
    })
    .select('id');

  if (error) {
    throw new Error('Failed to insert comment: ' + error.message);
  }

  return data?.[0]?.id;
}