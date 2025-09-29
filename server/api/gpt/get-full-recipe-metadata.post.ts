import { RecipeProcessed } from "~/types/exports";
import extractJson from "~/utils/format/extractJson";

export default defineEventHandler(async (event) => {
    const input = await readBody(event)
    const considerProcessing = input.considerProcessing
    const recipe = input.recipe as RecipeProcessed
    const assets = useStorage('assets:server')
    const processingPrompt = await assets.getItem('recipe-metadata/processing.txt') as string
    const tagsPrompt = await assets.getItem('recipe-metadata/tags.txt') as string
    const saltAndFatPrompt = await assets.getItem('recipe-metadata/salt-fat.txt') as string
    const hydrationPrompt = await assets.getItem('recipe-metadata/hydration-consumption.txt') as string


     let message = `
     Recipe Title: ${recipe.title}
     `;

     message += `
     Ingredients:
     `;
     for (const category of (recipe as any).ingredients_editable.ingredients) {
        message += `
        Category: ${category.categoryName}
        `;
        for (const ingredient of category.ingredients) {
        message += `
        ID: ${ingredient.id} - ${ingredient.name} - ${ingredient.amount} ${ingredient.unit}
        `;
     }}


     const messageWithoutInstructions = message;

     if (recipe.instructions && recipe.instructions.length) {
        message += `
        Instructions:
        `;
        for (let i = 0; i < recipe.instructions.length; i++) {
            message += `
            ${i + 1}. ${recipe.instructions[i]}
            `;
        }
     }
     
     let parsed = {
      general: null,
      processing: null,
      salt_and_fat: null,
      hydration: null
     }

    try {
        // Create promises for all requests
        const promises = [];
        const promiseTypes = [];

        // Processing request (conditional)
        if (considerProcessing) {
            promises.push($fetch('/api/gpt/response', {
                method: 'POST',
                body: {
                    systemPrompt: processingPrompt,
                    message: message,
                    type: 'default'
                },
            }));
            promiseTypes.push('processing');
        }

        // Tags request
        promises.push($fetch('/api/gpt/response', {
            method: 'POST',
            body: {
                systemPrompt: tagsPrompt,
                message: messageWithoutInstructions,
                type: 'default'
            },
        }));
        promiseTypes.push('general');

        // Salt and fat request
        promises.push($fetch('/api/gpt/response', {
            method: 'POST',
            body: {
                systemPrompt: saltAndFatPrompt,
                message: message,
                type: 'default'
            },
        }));
        promiseTypes.push('salt_and_fat');

        // Hydration request
        promises.push($fetch('/api/gpt/response', {
            method: 'POST',
            body: {
                systemPrompt: hydrationPrompt,
                message: message,
                type: 'default'
            },
        }));
        promiseTypes.push('hydration');

        // Wait for all promises to resolve
        const responses = await Promise.all(promises);

        // Process each response
        for (let i = 0; i < responses.length; i++) {
            const response = responses[i];
            const type = promiseTypes[i];

            if (!response) throw new Error(`No content returned from ${type} GPT response`);
            
            const result = extractJson(response);
            if (!result) throw new Error(`No JSON found in ${type} response`);
            
            (parsed as any)[type] = JSON.parse(result);
            console.log(`🔍 ${type.charAt(0).toUpperCase() + type.slice(1)} info done.`);
        }

        return parsed;
    } catch (err) {
      console.error('getFullRecipeMetadata error:', err);
      throw err;
    }  
  })