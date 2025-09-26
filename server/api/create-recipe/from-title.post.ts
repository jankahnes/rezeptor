import type { BaseRecipeInformation } from '~/types/exports';

import { serverSupabaseClient } from '#supabase/server'
import extractJson from '~/utils/format/extractJson';

//Uploads a recipe from a link
export default defineEventHandler(async (event) => {
    const input = await readBody(event)
    const {title, args, jobId} = input
    const supabase = await serverSupabaseClient(event);
    const assets = useStorage('assets:server')
    const ingredientsPrompt = await assets.getItem('recipe-create/ingredients-from-title.txt') as string;

    const ingredientsResponse = await $fetch('/api/gpt/response', {
        method: 'POST',
        body: {
            message: ingredientsPrompt.replace('{title}', title),
            type: 'default'
        }
    })
    if (!ingredientsResponse) throw new Error('No valid content returned from ingredients response');
    const ingredientsResponseJson = JSON.parse(extractJson(ingredientsResponse) as string)
    const baseRecipeInformation: BaseRecipeInformation = {
        title: title,
        ingredients_string: ingredientsResponseJson.ingredients,
        serves: ingredientsResponseJson.serves,
        batch_size: ingredientsResponseJson.batch_size,
        ...args
    }
    
    if(!baseRecipeInformation.batch_size && baseRecipeInformation.serves > 1) {
        baseRecipeInformation.batch_size = baseRecipeInformation.serves;
    }

    if(jobId) {
        await supabase.from('jobs').update({
            step_index: 1,
            updated_at: new Date()
        }).eq('id', jobId);
    }

    return await $fetch('/api/create-recipe/from-base', {
        method: 'POST',
        body: {
            base_recipe_information: baseRecipeInformation,
            jobId: jobId
        }
    })
})