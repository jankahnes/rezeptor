type Rating = {
  user_id: string;
  rating: number;
  recipe_id: number;
};

export default async function (rating: Rating, checkForExisting: boolean) {
  if (!rating.user_id) {
    throw new Error("Can't create a rating without being logged in.");
  }
  if (rating.rating < 0 || rating.rating > 5) {
    throw new Error('Rating has to be between 0 and 5.');
  }

  const supabase = useSupabase();

  if (checkForExisting) {
    const { data: existing, error: fetchError } = await supabase
      .from('ratings')
      .select('id')
      .eq('user_id', rating.user_id)
      .eq('recipe_id', rating.recipe_id)
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      throw new Error(
        'Failed to check for existing rating: ' + fetchError.message
      );
    }

    if (existing) {
      const { error: updateError } = await supabase
        .from('ratings')
        .update({ rating: rating.rating })
        .eq('id', existing.id);

      if (updateError) {
        throw new Error(
          'Failed to update existing rating: ' + updateError.message
        );
      }

      return existing.id;
    }
  }

  const { data, error } = await supabase
    .from('ratings')
    .insert({
      user_id: rating.user_id,
      recipe_id: rating.recipe_id,
      rating: rating.rating,
    })
    .select('id');

  if (error) {
    throw new Error('Failed to insert rating: ' + error.message);
  }

  return data?.[0]?.id;
}
