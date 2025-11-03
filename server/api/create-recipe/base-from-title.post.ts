import type { BaseRecipe } from '~/types/types';

import extractJson from '~/utils/format/extractJson';

//Returns a BaseRecipe object from a title
export default defineEventHandler(async (event) => {
  const input = await readBody(event);
  const { title, args } = input;
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
  const baseRecipe: BaseRecipe = {
    title: title,
    base_ingredients: ingredientsResponseJson.ingredients
      .split('\n')
      .map((ingredient: string) => ingredient.trim()),
    serves: ingredientsResponseJson.serves,
    batch_size:
      ingredientsResponseJson.serves > 1
        ? ingredientsResponseJson.serves
        : null,
    ...args,
  };

  return baseRecipe as BaseRecipe;
});
