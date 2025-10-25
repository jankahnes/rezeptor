import extractJson from '~/utils/format/extractJson';
import { UploadableRecipe } from '~/types/types';
import { getPublishingRequirements } from '~/utils/getPublishingRequirements';

export default defineEventHandler(async (event) => {
  const assets = useStorage('assets:server');
  const base_recipe_information: UploadableRecipe = (await readBody(
    event
  )) as UploadableRecipe;
  const publishingRequirements = getPublishingRequirements(base_recipe_information);

  const ingredientsString = base_recipe_information.ingredients
    .map(
      (ingredient: {
        name_original?: string;
        id: number;
        name?: string;
        primary_name?: string;
        preparation_description?: string;
      }) =>
        `${
          ingredient.name_original || ingredient.name || ingredient.primary_name
        } (${ingredient.preparation_description || ''}), ID ${ingredient.id}`
    )
    .join(';\n');
  let response = null;
  if (
    !publishingRequirements.hasInstructions
  ) {
    const descAndInstructionsPrompt = (await assets.getItem(
      'recipe-create/desc-and-instructions-from-ingredients.txt'
    )) as string;
    response = await $fetch('/api/gpt/response', {
      method: 'POST',
      body: {
        message: descAndInstructionsPrompt
          .replace('{ingredient_list}', ingredientsString)
          .replace('{title_info}', base_recipe_information.title),
        type: 'default',
      },
    });
  } else {
    const descAndInstructionsWithBasePrompt = (await assets.getItem(
      'recipe-create/desc-and-instructions-from-ingredients-with-base.txt'
    )) as string;
    response = await $fetch('/api/gpt/response', {
      method: 'POST',
      body: {
        message: descAndInstructionsWithBasePrompt
          .replace('{ingredient_list}', ingredientsString)
          .replace('{title_info}', base_recipe_information.title)
          .replace(
            '{instructions}',
            base_recipe_information.instructions!.join('\n')
          ),
        type: 'defaultInsensitive',
      },
    });
  }
  if (response) {
    const descAndInstructionJson = extractJson(response);
    if (!descAndInstructionJson) {
      throw new Error('No JSON found in desc and instructions response');
    }
    const descAndInstructionsResult = JSON.parse(descAndInstructionJson);
    if (!base_recipe_information.description) {
      return { ...descAndInstructionsResult };
    } else {
      return { instructions: descAndInstructionsResult.instructions };
    }
  }
});
