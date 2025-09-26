import extractJson from "~/utils/format/extractJson";

export default defineEventHandler(async (event) => {

    const assets = useStorage('assets:server')
    const base_recipe_information = await readBody(event)

    const ingredientsString = base_recipe_information.ingredients.map((ingredient: {name_original: string, id: number}) => `${ingredient.name_original  }, ID ${ingredient.id}`).join(';\n')
    let response = null;
    if(!base_recipe_information?.instructions?.length || !base_recipe_information.processing_requirements?.has_instructions) {
    const descAndInstructionsPrompt = await assets.getItem('recipe-create/desc-and-instructions-from-ingredients.txt') as string
    response = await $fetch('/api/gpt/response', {
        method: 'POST',
        body: {
            message: descAndInstructionsPrompt.replace('{ingredient_list}', ingredientsString).replace('{title_info}', base_recipe_information.title),
            type: 'default'
        }
    })
    }
    else if(!base_recipe_information.processing_requirements?.instructions_matched_to_ingredients) {
        const descAndInstructionsPrompt = await assets.getItem('recipe-create/desc-and-instructions-from-ingredients-with-base.txt') as string
        response = await $fetch('/api/gpt/response', {
            method: 'POST',
            body: {
                message: descAndInstructionsPrompt.replace('{ingredient_list}', ingredientsString).replace('{title_info}', base_recipe_information.title).replace('{instructions}', base_recipe_information.instructions.join('\n')),
                type: 'default'
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
            return {...descAndInstructionsResult}
        }
        else {
            return {instructions: descAndInstructionsResult.instructions}
        }
    }
})