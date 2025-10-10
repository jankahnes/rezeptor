import type { BaseRecipe } from '~/types/types';

import { serverSupabaseServiceRole } from '#supabase/server';
import extractJson from '~/utils/format/extractJson';
import type { Database } from '~/types/supabase'

//Uploads a recipe from a link
export default defineEventHandler(async (event) => {
  const input = await readBody(event);
  const { title, args, jobId } = input;
  const supabase = serverSupabaseServiceRole<Database>(event);
  const assets = useStorage('assets:server');
  const ingredientsPrompt = (await assets.getItem(
    'recipe-create/ingredients-from-title.txt'
  )) as string;
  let titleString = title;
  if (args.collection) {
    titleString = `${title} from the ${args.collection} collection`;
  }
  console.log('🔍 Gathering ingredient info from title');
  const ingredientsResponse = await $fetch('/api/gpt/response', {
    method: 'POST',
    body: {
      message: ingredientsPrompt.replace('{title}', titleString),
      type: 'accurate',
    },
  });
  if (!ingredientsResponse)
    throw new Error('No valid content returned from ingredients response');
  const ingredientsResponseJson = JSON.parse(
    extractJson(ingredientsResponse) as string
  );
  const baseRecipeInformation: BaseRecipe = {
    title: title,
    ingredients_string: ingredientsResponseJson.ingredients,
    serves: ingredientsResponseJson.serves,
    batch_size: ingredientsResponseJson.batch_size,
    ...args,
  };

  if (!baseRecipeInformation.batch_size && baseRecipeInformation.serves > 1) {
    baseRecipeInformation.batch_size = baseRecipeInformation.serves;
  }

  if (jobId) {
    await supabase
      .from('jobs')
      .update({
        step_index: 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId);
  }

  return await $fetch('/api/create-recipe/from-base', {
    method: 'POST',
    body: {
      base_recipe_information: baseRecipeInformation,
      jobId: jobId,
    },
  });
});
