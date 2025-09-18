import type { BaseRecipeInformation } from '~/types/exports';

import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const input = await readBody(event)
    const {link, args, jobId} = input
    const supabase = await serverSupabaseClient(event);

    //placeholder: call python api to use recipe-scrapers to scrape info
    //endpoint will return {
    //    title: string,
    //    ingredients_string: string[],
    //    instructions: string[]|null,
    //    description: string|null,
    //    serves: number,
    //    batch_size: number,
    //}
    
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