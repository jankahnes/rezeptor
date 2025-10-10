import type { BaseRecipe } from '~/types/types';
import { serverSupabaseServiceRole } from '#supabase/server'
import formidable from 'formidable';
import fs from 'fs/promises';
import type { Database } from '~/types/supabase'

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
        const jobId = parseInt(fields.jobId?.[0] ?? '0');
        const argsString = fields.args?.[0];
        
        if (!imageFile) {
            throw new Error('No image file found in request');
        }

        const args = argsString ? JSON.parse(argsString) : {};

        // Load the prompt from storage
        const promptContent = await useStorage('assets:server').getItem('recipe-create/picture-parsing.txt') as string;
        if (!promptContent) {
            throw new Error('Could not load picture parsing prompt');
        }

        // Read the image file and create FormData for GPT endpoint
        const imageBuffer = await fs.readFile(imageFile.filepath);
        const payload = {
        filename: imageFile.originalFilename,
        mimetype: imageFile.mimetype,
        prompt: promptContent,
        imageBase64: imageBuffer.toString('base64')
        };
        // Call GPT picture analysis endpoint
        const pictureAnalysisResponse = await $fetch('/api/gpt/pictureResponse', {
            method: 'POST',
            body: payload
        }) as {
            title: string;
            ingredients_string: string;
            instructions: string[] | null;
            description: string | null;
            serves: number;
            use_as_image: boolean | null;
        };

        if (!pictureAnalysisResponse || !pictureAnalysisResponse.title) {
            throw new Error('No valid content returned from picture analysis');
        }

        // Create BaseRecipeInformation object similar to from-link.post.ts
        const responseBase: BaseRecipe = {
            title: pictureAnalysisResponse.title,
            ingredients_string: pictureAnalysisResponse.ingredients_string,
            instructions: pictureAnalysisResponse.instructions,
            description: pictureAnalysisResponse.description,
            serves: pictureAnalysisResponse.serves,
            batch_size: pictureAnalysisResponse.serves > 1 ? pictureAnalysisResponse.serves : null,
            ...args // Merge the args (publish, source_type, user_id, etc.)
        };

        if(pictureAnalysisResponse.use_as_image) {
            responseBase.original_image_base64 = payload.imageBase64;
        }

        // Update job progress
        if (jobId) {
            await supabase.from('jobs').update({
                step_index: 1,
                updated_at: new Date().toISOString()
            }).eq('id', jobId);
        }

        // Forward to from-base endpoint
        return await $fetch('/api/create-recipe/from-base', {
            method: 'POST',
            body: {
                base_recipe_information: responseBase,
                jobId: jobId
            }
        });

    } catch (err) {
        console.error('Picture recipe creation error:', err);
        throw err;
    }
});
