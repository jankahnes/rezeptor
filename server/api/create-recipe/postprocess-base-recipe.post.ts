import { serverSupabaseServiceRole } from '#supabase/server';
import { Database } from '~/types/supabase';
import {
  BaseRecipe,
  ProcessingRequirement,
  RecipeRow,
  UploadableRecipe,
} from '~/types/types';
import convertUploadableToComputable from '~/server/utils/convertUploadableToComputable';

export default defineEventHandler(async (event) => {
  const input = await readBody(event);
  const {
    recipeId,
    jobId,
    publish,
  }: { recipeId: number; jobId: number; publish: boolean } = input;
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

  console.log('🔍 Formalizing ingredients string');
  //set polling step to formalizing_ingredients
  await supabase
    .from('jobs')
    .update({
      step: 'formalizing_ingredients',
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId);

  const { ingredients, notes } = await $fetch(
    '/api/create-recipe/formalize-ingredients',
    {
      method: 'POST',
      body: {
        base_ingredients: baseRecipe.base_ingredients?.join('\n'),
        recipe_context_string: baseRecipe.title,
        jobId: jobId,
      },
    }
  );

  if (
    !ingredients?.length ||
    ingredients.some(
      (ingredient: any) => ingredient.id === null || ingredient.id === undefined
    )
  ) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to formalize ingredients.',
    });
  }

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
        ...uploadableRecipe,
      },
    }
  )) as { description: string; instructions?: string[] };

  Object.assign(computableRecipe, descAndInstructions);

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

  if (!publish) {
    await supabase.from('jobs').delete().eq('id', jobId);
    return {
      status: 'ok',
    };
  }
  console.log('🔍 Publish ON, preparing required fields.');
  await supabase
    .from('jobs')
    .update({
      step: 'pre_publish',
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId);

  const promises = [];
  console.log('🔍 Calculating full nutrition');
  const fullNutritionPromise = $fetch(
    '/api/create-recipe/upload-processed-recipe',
    {
      method: 'POST',
      headers: {
        cookie: headers.cookie || '',
        authorization: headers.authorization || '',
      },
      body: {
        ...computableRecipe,
        full: true,
      },
    }
  );
  promises.push(fullNutritionPromise);

  if (!baseRecipe.picture) {
    console.log('🔍 No existing picture, generating AI placeholder picture');
    const picturePromise = $fetch('/api/create-recipe/get-processed-image', {
      method: 'POST',
      headers: {
        cookie: headers.cookie || '',
        authorization: headers.authorization || '',
      },
      body: baseRecipe,
    })
      .then((response) => {
        if (!response.image_base64) {
          throw createError({
            statusCode: 500,
            statusMessage: 'Failed to generate picture',
          });
        }

        console.log('🔍 Uploading AI placeholder picture');
        return $fetch('/api/db/upload-image', {
          method: 'POST',
          headers: {
            cookie: headers.cookie || '',
            authorization: headers.authorization || '',
          },
          body: {
            image: response.image_base64,
            bucket: 'recipe',
            id: recipeId,
          },
        });
      })
      .then((uploadResponse) => {
        if (!uploadResponse.publicUrl) {
          throw createError({
            statusCode: 500,
            statusMessage: 'Failed to upload picture',
          });
        }

        console.log('🔍 Picture uploaded, updating recipe');
        return supabase
          .from('recipes')
          .update({ picture: uploadResponse.publicUrl })
          .eq('id', recipeId)
          .then(({ error }) => {
            if (error) {
              throw createError({
                statusCode: 500,
                statusMessage: 'Failed to update recipe picture',
              });
            }
            return uploadResponse;
          });
      })
      .catch((error) => {
        throw createError({
          statusCode: 500,
          statusMessage: error.statusMessage || 'Failed to process picture',
        });
      });

    promises.push(picturePromise);
  }

  await Promise.all(promises);

  console.log('🔍 All required fields prepared, deleting job');

  await supabase.from('jobs').delete().eq('id', jobId);

  return {
    status: 'ok',
  };
});
