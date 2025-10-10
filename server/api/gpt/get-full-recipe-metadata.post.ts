import type { ComputedRecipe, GptMetadataResponse } from '~/types/types';
import extractJson from '~/utils/format/extractJson';
import groupIngredients from '~/utils/format/groupIngredients';
import removeInstructionFormatting from '~/utils/format/removeInstructionFormatting';

export default defineEventHandler(
  async (event): Promise<GptMetadataResponse> => {
    const input = await readBody(event);
    const considerProcessing = input.considerProcessing;
    const recipe = input.recipe as ComputedRecipe;
    const baseTotalWeight = input.baseTotalWeight;
    const assets = useStorage('assets:server');
    const processingPrompt = (await assets.getItem(
      'recipe-metadata/processing.txt'
    )) as string;
    const tagsPrompt = (await assets.getItem(
      'recipe-metadata/tags.txt'
    )) as string;
    const saltAndFatPrompt = (await assets.getItem(
      'recipe-metadata/salt-fat.txt'
    )) as string;
    const hydrationPrompt = (await assets.getItem(
      'recipe-metadata/hydration-consumption.txt'
    )) as string;

    const groupedIngredients = groupIngredients(recipe.fullIngredients);
    let message = `
     Recipe Title: ${recipe.title}
     `;

    message += `
     Ingredients for ${recipe.serves} servings:
     `;
    for (const category of Object.keys(groupedIngredients)) {
      message += `
        Category: ${category}
        `;
      for (const ingredient of groupedIngredients[category]) {
        message += `
        ID: ${ingredient.id} - ${ingredient.name} - ${ingredient.amount} ${ingredient.unit}
        `;
      }
    }

    const messageWithoutInstructions = message;

    const instructions = removeInstructionFormatting(recipe.instructions || []);
    if (recipe.instructions && recipe.instructions.length) {
      message += `
        Instructions:
        `;
      for (let i = 0; i < instructions.length; i++) {
        message += `
            ${i + 1}. ${instructions[i]}
            `;
      }
    }

    message += `Basic estimated total weight per serving: ${baseTotalWeight}g`;

    let parsed: GptMetadataResponse = {
      general: null,
      processing: null,
      salt_and_fat: null,
      hydration: null,
    };

    try {
      // Create promises for all requests
      const promises = [];
      const promiseTypes = [];

      // Processing request (conditional)
      if (considerProcessing) {
        promises.push(
          $fetch('/api/gpt/response', {
            method: 'POST',
            body: {
              systemPrompt: processingPrompt,
              message: message,
              type: 'default',
            },
          })
        );
        promiseTypes.push('processing');
      }

      // Tags request
      promises.push(
        $fetch('/api/gpt/response', {
          method: 'POST',
          body: {
            systemPrompt: tagsPrompt,
            message: messageWithoutInstructions,
            type: 'default',
          },
        })
      );
      promiseTypes.push('general');

      // Salt and fat request
      promises.push(
        $fetch('/api/gpt/response', {
          method: 'POST',
          body: {
            systemPrompt: saltAndFatPrompt,
            message: message,
            type: 'default',
          },
        })
      );
      promiseTypes.push('salt_and_fat');

      // Hydration request
      promises.push(
        $fetch('/api/gpt/response', {
          method: 'POST',
          body: {
            systemPrompt: hydrationPrompt,
            message: message,
            type: 'default',
          },
        })
      );
      promiseTypes.push('hydration');

      // Wait for all promises to resolve
      const responses = await Promise.all(promises);

      // Process each response
      for (let i = 0; i < responses.length; i++) {
        const response = responses[i];
        const type = promiseTypes[i];

        if (!response)
          throw new Error(`No content returned from ${type} GPT response`);

        const result = extractJson(response);
        if (!result) throw new Error(`No JSON found in ${type} response`);

        (parsed as any)[type] = JSON.parse(result);
        console.log(
          `🔍 ${type.charAt(0).toUpperCase() + type.slice(1)} info done.`
        );
      }

      return parsed;
    } catch (err) {
      console.error('getFullRecipeMetadata error:', err);
      throw err;
    }
  }
);
