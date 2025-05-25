type Rating = {
  user_id: string;
  rating: number;
  recipe_id: number;
};

export default async function (rating: Rating) {
  if (!rating.user_id) {
    throw new Error("Can't create a rating without being logged in.");
  }
  if (rating.rating < 0 || rating.rating > 5) {
    throw new Error('Rating has to be between 0 and 5.');
  }
  const supabase = useSupabase();
  const { error } = await supabase.from('ratings').insert({
    user_id: rating.user_id,
    rating: rating.rating,
    recipe_id: rating.recipe_id,
  });

  if (error) {
    throw new Error('Failed to insert comment: ' + error.message);
  }
}
