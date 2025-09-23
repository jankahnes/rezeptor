import extractJson from "~/utils/format/extractJson"
import { serverSupabaseClient } from '#supabase/server'


//Uploads a recipe from BaseRecipeInformation object
export default defineEventHandler(async (event) => {
    const input = await readBody(event)
    const {base_recipe_information, jobId} = input
    const supabase = await serverSupabaseClient(event);
    const assets = useStorage('assets:server')
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
            updated_at: new Date(),
            message: ''
        }).eq('id', jobId);
    }
    
    if(base_recipe_information.publish || base_recipe_information.uploading_protocol === 'full') {
        const ingredientsString = base_recipe_information.ingredients.map((ingredient) => `${ingredient.name}, ID ${ingredient.id}`).join(';\n')
        let response = null;
        if(!base_recipe_information?.instructions?.length) {
        const descAndInstructionsPrompt = await assets.getItem('recipe-create/desc-and-instructions-from-ingredients.txt') as string
        response = await $fetch('/api/gpt/response', {
            method: 'POST',
            body: {
                message: descAndInstructionsPrompt.replace('{ingredient_list}', ingredientsString).replace('{title_info}', base_recipe_information.title),
                model: 'gpt-5'
            }
        })}
        else {
            const descAndInstructionsPrompt = await assets.getItem('recipe-create/desc-and-instructions-from-ingredients-with-base.txt') as string
            response = await $fetch('/api/gpt/response', {
                method: 'POST',
                body: {
                    message: descAndInstructionsPrompt.replace('{ingredient_list}', ingredientsString).replace('{title_info}', base_recipe_information.title).replace('{instructions}', base_recipe_information.instructions.join('\n')),
                    model: 'gpt-5'
                }
            })
        }
        if(response) {
            const descAndInstructionJson = extractJson(response)
            if(!descAndInstructionJson) {
                throw new Error('No JSON found in desc and instructions response')
            }
            const descAndInstructionsResult = JSON.parse(descAndInstructionJson)
            if(!base_recipe_information.description) {
                base_recipe_information.description = descAndInstructionsResult.description
            }
            base_recipe_information.instructions = descAndInstructionsResult.instructions
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