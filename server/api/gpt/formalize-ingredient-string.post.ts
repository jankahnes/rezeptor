import extractJson from '~/utils/format/extractJson'
import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/supabase';
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

    const input = await readBody(event)
    const {ingredients_string, recipe_context_string, jobId} = input
    const supabase = serverSupabaseServiceRole<Database>(event);
    
    const formalizeResponse = await $fetch('/api/gpt/response', {
        method: 'POST',
        body: {
            message: formalizePrompt.replace('{ingredient_list}', ingredients_string).replace('{recipe_title}', recipe_context_string),
            type: 'default'
        },
    })
    if (!formalizeResponse) throw new Error('No content returned from formalize response');
    const extractedJson = extractJson(formalizeResponse)
    if (!extractedJson) throw new Error('No JSON found in formalize response');
    const formalizeResult = JSON.parse(extractedJson)

    if(jobId) {
        await supabase.from('jobs').update({
            step_index: 3,
            updated_at: new Date().toISOString()
        }).eq('id', jobId);
    }

    // Process ingredients from the combined prompt response
    let processedIngredients = formalizeResult.ingredients.map((ingredient: any) => {
        return {
            name_original: ingredient.name,
            preparation_description: ingredient.extra || null,
            unit: ingredient.unit,
            amount: ingredient.amount,
            category: ingredient.category || null
        }
    })
    let notes = []
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
                ingredient.id = null
                notes.push(`${ingredient.name_original} rejected by food request system.`)
            } else {
                ingredient.id = response?.data.id
                
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
                        ingredient.unit = "free"
                        ingredient.amount = 0
                        notes.push(`${ingredient.name_original} with unit ${ingredient.unit} caused an error in the unit reconciliation system.`)
                    }
                }
            }
        } catch (error) {
            console.error(`Error processing ingredient ${ingredient.name_original}:`, error)
            ingredient.id = null
            notes.push(`${ingredient.name_original} caused an error in the food request system.`)
        }
    }
    processedIngredients = processedIngredients.filter((ingredient: any) => ingredient.id !== null)
    return { ingredients: processedIngredients, notes: notes }
})