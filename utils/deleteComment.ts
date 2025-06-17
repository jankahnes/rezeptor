type Comment = {
  id: number;
  user: { id: number };
};

export default async function (comment: Comment) {
  //if (!comment.user.id) {
  //  throw new Error("Can't create a comment without being logged in.");
  //}
  const supabase = useSupabase();
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', comment.id);

  if (error) {
    throw new Error('Failed to delete comment: ' + error.message);
  }
}
