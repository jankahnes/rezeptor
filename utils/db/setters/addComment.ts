import type { SupabaseClient } from "@supabase/supabase-js";

type Comment = {
  user_id: string;
  replying_to?: number;
  content: string;
  recipe_id: number;
};

export default async function (supabase: SupabaseClient, comment: Comment) {
  if (!comment.user_id) {
    throw new Error("Can't create a comment without being logged in.");
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
