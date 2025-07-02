import type { SupabaseClient } from "@supabase/supabase-js";

export default async function (supabase: SupabaseClient, id: number, content: string) {
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
