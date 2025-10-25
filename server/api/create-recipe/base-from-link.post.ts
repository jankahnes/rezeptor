import type { BaseRecipe } from '~/types/types';

//Returns a BaseRecipe object from a link
export default defineEventHandler(async (event) => {
  const input = await readBody(event);
  const { link, args } = input;

  const responseBase = (await $fetch(
    'https://jk-api.onrender.com/scrape-recipe-page',
    {
      method: 'POST',
      body: {
        url: link,
      },
    }
  )) as any;
  if (!responseBase || !responseBase.title)
    throw new Error('No valid content returned from scrape response');
  Object.assign(responseBase, args);
  responseBase.base_ingredients = responseBase.ingredients_string
    .split('\n')
    .map((ingredient: string) => ingredient.trim());

  return responseBase as BaseRecipe;
});
