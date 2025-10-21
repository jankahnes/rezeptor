import type { BaseRecipe } from '~/types/types';

import { serverSupabaseServiceRole } from '#supabase/server';
import type { Database } from '~/types/supabase';

//Uploads a recipe from a link
export default defineEventHandler(async (event) => {
  const input = await readBody(event);
  const { link, args, jobId } = input;
  const supabase = serverSupabaseServiceRole<Database>(event);

  const responseBase = (await $fetch(
    'https://jk-api.onrender.com/scrape-recipe-page',
    {
      method: 'POST',
      body: {
        url: link,
      },
    }
  )) as BaseRecipe;
  if (!responseBase || !responseBase.title)
    throw new Error('No valid content returned from scrape response');
  Object.assign(responseBase, args);
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
      base_recipe_information: responseBase,
      jobId: jobId,
    },
  });
});
