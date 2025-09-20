import extractJson from "~/utils/format/extractJson"
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const input = await readBody(event)
    const {base_recipe_information, jobId} = input
    const supabase = await serverSupabaseClient(event);
    const assets = useStorage('assets:server')
    const descAndInstructionsPrompt = await assets.getItem('recipe-create/desc-and-instructions-from-ingredients.txt') as string
    Object.assign(base_recipe_information, await $fetch('/api/gpt/formalize-ingredient-string', {
        method: 'POST',
        body: {
            ingredients_string: base_recipe_information.ingredients_string,
            recipe_context_string: base_recipe_information.title,
            jobId: jobId
        }
    }))
    if(jobId) {
        await supabase.from('jobs').update({
            step_index: 4,
            updated_at: new Date()
        }).eq('id', jobId);
    }
    
    if(base_recipe_information.publish || base_recipe_information.uploading_protocol === 'full') {
        if(!base_recipe_information.description || !base_recipe_information?.instructions?.length) {
        const descAndInstructionsResponse = await $fetch('/api/gpt/response', {
            method: 'POST',
            body: {
                message: descAndInstructionsPrompt.replace('{ingredients}', base_recipe_information.ingredients_string),
                model: 'gpt-5'
            }
        })
        if(descAndInstructionsResponse) {
            const descAndInstructionJson = extractJson(descAndInstructionsResponse)
            if(!descAndInstructionJson) {
                throw new Error('No JSON found in desc and instructions response')
            }
            const descAndInstructionsResult = JSON.parse(descAndInstructionJson)
            Object.assign(base_recipe_information, descAndInstructionsResult)
        }
        }
        if(jobId) {
            await supabase.from('jobs').update({
                step_index: 5,
                updated_at: new Date()
            }).eq('id', jobId);
        }
        // placeholder: call python endpoint to generate picture
    }
    return await $fetch('/api/create-recipe/from-uploadable', {
        method: 'POST',
        body: {
            ...base_recipe_information,
            jobId: jobId
        }
    })
})