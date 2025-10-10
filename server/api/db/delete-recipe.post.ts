import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server';
import type { Database } from '~/types/supabase';


export default defineEventHandler(async (event) => {
  const { recipeId } = await readBody(event);
  const config = useRuntimeConfig();
  const client = serverSupabaseServiceRole<Database>(event);
  let user: any = null;
  try {
    user = await serverSupabaseUser(event);
  } catch (error) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized (No auth session)' });
  }
  if(user?.id == config.adminUuid) {
    console.log("Overriding owner check for admin");
  } else {
    const { data: existingRecipe, error: fetchError } = await client.from('recipes').select('user_id').eq('id', recipeId).single() as { data: { user_id: string } | null, error: any };
    if (fetchError || !existingRecipe) {
      throw createError({ statusCode: 404, statusMessage: 'Recipe not found' });
    }
    if (existingRecipe.user_id !== user?.id) {
      throw createError({ statusCode: 403, statusMessage: 'Not authorized to delete this recipe' });
    }
    console.log("Deleting recipe", recipeId, "owned by", existingRecipe.user_id, "and user is", user?.id);
  }
  const { error } = await client.from('recipes').delete().eq('id', recipeId);
  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to delete recipe' });
  }
  return { status: 'ok' };
});