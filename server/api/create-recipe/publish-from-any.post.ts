import type { BaseRecipe } from '~/types/types';

type AnyInput = {
  source_type: 'TITLE' | 'WEBSITE';
  source: string;
  collection?: string | null;
};

export default defineEventHandler(async (event) => {
  const input = await readBody(event);
  const { source_type, source, collection }: AnyInput = input;
  let baseRecipe: BaseRecipe;
  switch (source_type) {
    case 'TITLE':
      baseRecipe = await $fetch('/api/create-recipe/base-from-title', {
        method: 'POST',
        body: { title: source, args: { source_type, args: { collection } } },
      });
      break;
    case 'WEBSITE':
      baseRecipe = await $fetch('/api/create-recipe/base-from-link', {
        method: 'POST',
        body: { link: source, args: { source_type, source, args: { collection } } },
      });
      break;
  }
  const { id } = await $fetch('/api/create-recipe/upload-base-recipe', {
    method: 'POST',
    body: { baseRecipe },
  });
  await $fetch('/api/create-recipe/postprocess-base-recipe', {
    method: 'POST',
    body: { recipeId: id, publish: true },
  });
  return { status: 'ok', id };
});
