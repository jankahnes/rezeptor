import type { SupabaseClient } from "@supabase/supabase-js";

type Comment = {
  id: number;
  user: { id: number };
};

export default async function (supabase: SupabaseClient, comment: Comment) {
  //if (!comment.user.id) {
  //  throw new Error("Can't create a comment without being logged in.");
  //}
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', comment.id);

  if (error) {
    throw new Error('Failed to delete comment: ' + error.message);
  }
}
