import extractJson from '~/utils/format/extractJson'
import { serverSupabaseClient } from '#supabase/server'

/**
 * Input: {
 * ingredients_string: string
 * recipe_context_string: string
 * }
 * 
 * Output: {
 * ingredients: {id: number, name: string, preparation_description: string|null, category: string|null, unit: string, amount: number}[]
 * }
 */ 

export default defineEventHandler(async (event) => {
    const assets = useStorage('assets:server')
    const formalizePrompt = await assets.getItem('recipe-create/ingredient-formalization.txt') as string
    const parsePrompt = await assets.getItem('recipe-create/ingredient-desc-parsing.txt') as string

    const input = await readBody(event)
    const {ingredients_string, recipe_context_string, jobId} = input
    const supabase = await serverSupabaseClient(event);
    console.log('🔍 Formalizing ingredients string')
    const formalizeResponse = await $fetch('/api/gpt/response', {
        method: 'POST',
        body: {
            message: formalizePrompt.replace('{ingredient_list}', ingredients_string).replace('{recipe_title}', recipe_context_string),
            model: 'gpt-5'
        },
    })
    if (!formalizeResponse) throw new Error('No content returned from formalize response');
    const extractedJson = extractJson(formalizeResponse)
    if (!extractedJson) throw new Error('No JSON found in formalize response');
    const formalizeResult = JSON.parse(extractedJson)

    if(jobId) {
        await supabase.from('jobs').update({
            step_index: 2,
            updated_at: new Date()
        }).eq('id', jobId);
    }

    console.log('🔍 Parsing ingredient descriptions')
    const ingredients = formalizeResult.ingredients;
    for (let i = 0; i < ingredients.length; i++) {
        ingredients[i]['id'] = i + 1;
    }
    const relevant_recipe_data_for_prompt = ingredients.map((ingredient: any) => `ID: ${ingredient['id']}, Description: ${ingredient['description']}`).join('\n');

    const parseResponse = await $fetch('/api/gpt/response', {
        method: 'POST',
        body: {
            message: parsePrompt.replace('{ingredients}', relevant_recipe_data_for_prompt).replace('{recipe_string}', recipe_context_string),
            model: 'gpt-5'
        },
    })
    if (!parseResponse) throw new Error('No content returned from parse response');
    const extractedJsonParse = extractJson(parseResponse)
    if (!extractedJsonParse) throw new Error('No JSON found in parse response');
    const parseResult = JSON.parse(extractedJsonParse)

    if(jobId) {
        await supabase.from('jobs').update({
            step_index: 3,
            updated_at: new Date()
        }).eq('id', jobId);
    }

    // Update ingredients with extracted names
    const nameMapping: Record<number, {name: string, preparation_description: string | null}> = {}
    const splitNamesData = parseResult
    
    if (splitNamesData.ingredients) {
        for (const item of splitNamesData.ingredients) {
            nameMapping[item.id] = {
                name: item.name,
                preparation_description: item.extra || null
            }
        }
    }
    
    // Remove ingredients that don't have a mapping and update the remaining ones
    const processedIngredients = ingredients
        .filter((ingredient: any) => ingredient.id in nameMapping)
        .map((ingredient: any) => {
            const mapping = nameMapping[ingredient.id]
            const updatedIngredient = { ...ingredient }
            
            updatedIngredient.name_original = mapping.name
            updatedIngredient.preparation_description = mapping.preparation_description
            
            // Remove unwanted properties
            delete updatedIngredient.id
            if ('name' in updatedIngredient) {
                delete updatedIngredient.name
            }
            
            return updatedIngredient
        })


    // Process ingredients to get food IDs
    console.log('🔍 Processing ingredients to get food IDs')
    for (const ingredient of processedIngredients) {
        console.log(`Processing: ${ingredient.name_original}`)
        if(jobId) {
            await supabase.from('jobs').update({
                message: `Looking into ${ingredient.name_original}`
            }).eq('id', jobId);
        }
        try {
            const response = await $fetch('/api/db/request-food', {
                method: 'POST',
                body: { query: ingredient.name_original }
            })
            
            if (response?.data?.action_taken === "reject") {
                ingredient.id = "Request was rejected."
            } else {
                ingredient.id = response?.data?.id
                
                if (ingredient.id && (!["g", "ml", "tsp", "tbsp", "free", "kg", "oz", "lb", "cup", "l"].includes(ingredient.unit))) {
                    try {
                        const unitResponse = await $fetch('/api/db/reconcile-unit', {
                            method: 'POST',
                            body: { 
                                food_name_id: ingredient.id,
                                unit: ingredient.unit
                            }
                        })
                        ingredient.unit = unitResponse.unit_name
                    } catch (unitError) {
                        console.error(`Error reconciling unit for ${ingredient.name_original}:`, unitError)
                    }
                }
            }
        } catch (error) {
            console.error(`Error processing ingredient ${ingredient.name_original}:`, error)
            ingredient.id = null
        }
    }

    console.log("Finished formalizing ingredients.")
    return { ingredients: processedIngredients }
})