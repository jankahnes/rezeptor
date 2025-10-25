import { Database, RecipeRow } from '~/types/types';
import { serverSupabaseServiceRole } from '#supabase/server';
import { getRecipe } from '~/utils/db/getters/getRecipes';

export default defineEventHandler(async (event) => {
  const input = await readBody(event);
  const { recipeId, jobId }: { recipeId: number; jobId: number } = input;
  const supabase = serverSupabaseServiceRole<Database>(event);
  // fetch base recipe
  const recipe = await getRecipe(
    supabase,
    {
      eq: {
        id: recipeId,
      },
    }
  );
  if (!recipe) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Recipe not found',
    });
  }
  await supabase
    .from('jobs')
    .update({
      step: 'formalizing_instructions',
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId);

  console.log('🔍 Formalizing instructions');
  const descAndInstructions = (await $fetch(
    '/api/create-recipe/formalize-instructions',
    {
      method: 'POST',
      body: {
        ...recipe,
      },
    }
  )) as { description: string; instructions?: string[] };

  const { error } = await supabase
    .from('recipes')
    .update(descAndInstructions)
    .eq('id', recipeId);

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage:
        'Failed to update recipe with description and instructions',
    });
  }

  await supabase.from('jobs').delete().eq('id', jobId);
  return {
    status: 'ok',
  };
});
