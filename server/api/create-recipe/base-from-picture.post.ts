import type { BaseRecipe } from '~/types/types';
import formidable from 'formidable';
import fs from 'fs/promises';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default defineEventHandler(async (event) => {
  try {
    // Parse multipart form data using formidable
    const form = formidable({ multiples: false });
    const [fields, files] = await form.parse(event.node.req);

    // Extract data from parsed form
    const imageFile = files.image?.[0];
    const argsString = fields.args?.[0];

    if (!imageFile) {
      throw new Error('No image file found in request');
    }

    const args = argsString ? JSON.parse(argsString) : {};

    // Load the prompt from storage
    const promptContent = (await useStorage('assets:server').getItem(
      'recipe-create/picture-parsing.txt'
    )) as string;
    if (!promptContent) {
      throw new Error('Could not load picture parsing prompt');
    }

    // Read the image file and create FormData for GPT endpoint
    const imageBuffer = await fs.readFile(imageFile.filepath);
    const payload = {
      filename: imageFile.originalFilename,
      mimetype: imageFile.mimetype,
      prompt: promptContent,
      imageBase64: imageBuffer.toString('base64'),
    };
    // Call GPT picture analysis endpoint
    const pictureAnalysisResponse = (await $fetch('/api/gpt/pictureResponse', {
      method: 'POST',
      body: payload,
    })) as {
      title: string;
      base_ingredients: string;
      instructions: string[] | null;
      description: string | null;
      serves: number;
      use_as_image: boolean | null;
    };

    if (!pictureAnalysisResponse || !pictureAnalysisResponse.title) {
      throw new Error('No valid content returned from picture analysis');
    }

    const responseBase: BaseRecipe = {
      title: pictureAnalysisResponse.title,
      base_ingredients: pictureAnalysisResponse.base_ingredients.split('\n').map((ingredient: string) => ingredient.trim()),
      instructions: pictureAnalysisResponse.instructions,
      description: pictureAnalysisResponse.description,
      serves: pictureAnalysisResponse.serves,
      batch_size:
        pictureAnalysisResponse.serves > 1
          ? pictureAnalysisResponse.serves
          : null,
      ...args,
    };

    if (pictureAnalysisResponse.use_as_image) {
      responseBase.original_image_base64 = payload.imageBase64;
    }

    return responseBase as BaseRecipe;
  } catch (err) {
    console.error('Picture recipe creation error:', err);
    throw err;
  }
});
