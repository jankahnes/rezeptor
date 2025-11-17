import { serverSupabaseServiceRole } from '#supabase/server';
import formidable from 'formidable';
import fs from 'fs/promises';
import type { Database } from '~/types/supabase';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole<Database>(event);

  try {
    // Parse multipart form data using formidable
    const form = formidable({ multiples: false });
    const [fields, files] = await form.parse(event.node.req);

    // Extract data from parsed form
    const imageFile = files.image?.[0];
    const barcode = fields.barcode?.[0];

    if (!imageFile || !barcode) {
      throw new Error('No image file or barcode found in request');
    }

    // Load the prompt from storage
    const promptContent = (await useStorage('assets:server').getItem(
      'branded-food-system/extract-nutrition-label-from-image-prompt.txt'
    )) as string;
    if (!promptContent) {
      throw new Error('Could not load nutrition label extraction prompt');
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
      kcal?: number | null;
      fat?: number | null;
      saturated_fat?: number | null;
      carbohydrates?: number | null;
      sugar?: number | null;
      protein?: number | null;
      fiber?: number | null;
      salt?: number | null;
      error?: string | null;
    };

    if (!pictureAnalysisResponse || pictureAnalysisResponse.error) {
      throw new Error(
        pictureAnalysisResponse.error ||
          'No valid content returned from picture analysis'
      );
    }

    pictureAnalysisResponse.kcal = Math.round(
      pictureAnalysisResponse.kcal ?? 0
    );

    await supabase
      .from('branded_foods')
      .update(pictureAnalysisResponse)
      .eq('barcode', barcode);

    return {
      status: 'ok',
      data: pictureAnalysisResponse,
    };
  } catch (err) {
    console.error('Nutrition update error:', err);
    throw createError({
      statusCode: 500,
      statusMessage:
        'Something went wrong while updating nutrition from picture',
      data: (err as Error).message,
    });
  }
});
