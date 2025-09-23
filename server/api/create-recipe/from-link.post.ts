import type { BaseRecipeInformation } from '~/types/exports';

import { serverSupabaseClient } from '#supabase/server'

//Uploads a recipe from a link
export default defineEventHandler(async (event) => {
    const input = await readBody(event)
    const {link, args, jobId} = input
    const supabase = await serverSupabaseClient(event);
    
    const responseBase = await $fetch('https://jk-api.onrender.com/scrape-recipe-page', {
        method: 'POST',
        body: {
            url: link
        }
    }) as BaseRecipeInformation;
    if (!responseBase || !responseBase.title) throw new Error('No valid content returned from scrape response');
    Object.assign(responseBase, args);
    if(jobId) {
        await supabase.from('jobs').update({
            step_index: 1,
            updated_at: new Date()
        }).eq('id', jobId);
    }

    return await $fetch('/api/create-recipe/from-base', {
        method: 'POST',
        body: {
            base_recipe_information: responseBase,
            jobId: jobId
        }
    })
})