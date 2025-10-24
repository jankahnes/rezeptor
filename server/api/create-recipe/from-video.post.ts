import type { BaseRecipe } from '~/types/types';

import { serverSupabaseServiceRole } from '#supabase/server';
import type { Database } from '~/types/supabase';

//Uploads a recipe from a video
export default defineEventHandler(async (event) => {
  const input = await readBody(event);
  const { url, args, jobId } = input;
  const supabase = serverSupabaseServiceRole<Database>(event);

  const responseBase = (await $fetch(
    'https://jk-api.onrender.com/extract-recipe-from-video',
    {
      method: 'POST',
      body: {
        url: url,
      },
    }
  )) as any;
  if (!responseBase)
    throw new Error('No valid content returned from video extraction response');
  if (
    !responseBase.ingredients_string ||
    !responseBase.serves ||
    !responseBase.title
  )
    throw new Error(
      'No valid content returned from video extraction response, missing required fields'
    );
  Object.assign(responseBase, args);
  responseBase.original_creator_channel_name = responseBase.channel ?? null;
  responseBase.original_creator_channel_id = responseBase.channel_id ?? null;

  if (jobId) {
    await supabase
      .from('jobs')
      .update({
        step_index: 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId);
  }

  const headers = getRequestHeaders(event);
  return await $fetch('/api/create-recipe/from-base', {
    method: 'POST',
    headers: {
      cookie: headers.cookie || '',
      authorization: headers.authorization || '',
    },
    body: {
      base_recipe_information: responseBase as BaseRecipe,
      jobId: jobId,
    },
  });
});
