import { Database, RecipeRow } from '~/types/types';
import { serverSupabaseServiceRole } from '#supabase/server';
import { getRecipe } from '~/utils/db/getters/getRecipes';
import { UploadableRecipe } from '~/types/types';
import convertUploadableToComputable from '~~/server/utils/convertUploadableToComputable';

export default defineEventHandler(async (event) => {
  const input = await readBody(event);
  const { recipeId, jobId }: { recipeId: number; jobId: number } = input;
  const supabase = serverSupabaseServiceRole<Database>(event);
  const headers = getRequestHeaders(event);
  // fetch base recipe
  const { data: baseRecipe }: { data: RecipeRow | null } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', recipeId)
    .single();

  if (!baseRecipe || !baseRecipe.base_ingredients_serves) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Recipe not found or missing required field : serves',
    });
  }

  await supabase
    .from('jobs')
    .update({
      step: 'formalizing_ingredients',
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId);

  console.log('🔍 Formalizing ingredients');

  const { ingredients, notes } = await $fetch(
    '/api/create-recipe/formalize-ingredients',
    {
      method: 'POST',
      body: {
        base_ingredients: baseRecipe.base_ingredients?.join('\n'),
        recipe_context_string: baseRecipe.title,
      },
    }
  );

  console.log('🔍 Converting uploadable recipe to computable recipe');
  const uploadableRecipe: UploadableRecipe = {
    ...baseRecipe,
    serves: baseRecipe.base_ingredients_serves,
    ingredients: ingredients,
    notes: notes,
  };

  const computableRecipe = await convertUploadableToComputable(
    uploadableRecipe,
    supabase
  );

  console.log('🔍 Updating recipe with nutrition');
  const response = await $fetch('/api/create-recipe/upload-processed-recipe', {
    method: 'POST',
    headers: {
      cookie: headers.cookie || '',
      authorization: headers.authorization || '',
    },
    body: {
      ...computableRecipe,
      full: false,
    },
  });

  if (response.status !== 'ok') {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create recipe',
    });
  }

  console.log('🔍 Updated recipe with nutrition, deleting job');
  await supabase.from('jobs').delete().eq('id', jobId);
  return {
    status: 'ok',
  };
});
