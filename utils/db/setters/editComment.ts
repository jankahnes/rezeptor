export default async function (id: number, content: string) {
  const supabase = useSupabase();
  const { error: updateError } = await supabase
    .from('comments')
    .update({ content: content })
    .eq('id', id);

  if (updateError) {
    throw new Error(
      'Failed to update existing comment: ' + updateError.message
    );
  }
}
