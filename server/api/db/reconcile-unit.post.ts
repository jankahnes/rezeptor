import { serverSupabaseClient } from '#supabase/server'
import extractJson from '~/utils/format/extractJson'

/**
 * Input: {
 *   food_name_id: number  // from request-food (food_names.id)
 *   unit: string
 * }
 * 
 * Output: {
 *   unit_name: string
 * }
 */

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient(event)
    const assets = useStorage('assets:server')
    const { food_name_id, unit } = await readBody(event)

    // Step 2: Replace "piece" with empty string
    let processedUnit = unit === "whole" ? "" : unit
    
    // If unit is empty after processing, use "piece" as default
    if (!processedUnit) {
        processedUnit = "whole"
    }

    // Step 3: Get the actual food record via food_names table
    const { data: foodName, error: foodNameError } = await supabase
        .from('food_names')
        .select('food_id, food:foods(countable_units)')
        .eq('id', food_name_id)
        .single()

    if (foodNameError) {
        throw new Error(`Error fetching food name: ${foodNameError.message}`)
    }

    const food = (foodName as any).food
    if (!food) {
        throw new Error('Food not found')
    }

    const countableUnits = food.countable_units || {}
    
    // Step 4: Check if unit matches any key
    const unitKeys = Object.keys(countableUnits)
    
    // Convert empty string to "whole" for AI understanding, and add to available units display
    const displayUnits = { ...countableUnits }
    if ('' in displayUnits) {
        displayUnits['whole'] = displayUnits['']
        delete displayUnits['']
    }
    const displayUnitKeys = Object.keys(displayUnits)
    
    // Direct match (case insensitive) - check both original unit and "whole" conversion
    const directMatch = unitKeys.find(key => 
        key.toLowerCase() === processedUnit.toLowerCase()
    )
    
    if (directMatch) {
        return { unit_name: directMatch }
    }

    // Check for "whole" -> "" conversion
    if (processedUnit.toLowerCase() === "whole" && '' in countableUnits) {
        return { unit_name: '' }
    }

    // Check for plural/singular variations
    const pluralMatch = unitKeys.find(key => {
        const keyLower = key.toLowerCase()
        const unitLower = processedUnit.toLowerCase()
        return keyLower === unitLower + 's' || 
               keyLower + 's' === unitLower ||
               keyLower === unitLower.slice(0, -1) ||
               keyLower + 'es' === unitLower
    })

    if (pluralMatch) {
        return { unit_name: pluralMatch }
    }

    // Step 5: No match found, use GPT to judge
    const prompt = await assets.getItem('recipe-create/unit-reconciliation.txt') as string
    
    // Format available units with their weights (using display units with "whole" instead of "")
    const availableUnitsText = displayUnitKeys.length > 0 
        ? displayUnitKeys.map(key => `${key}: ${displayUnits[key]}g`).join('\n')
        : 'No units available'

    const gptResponse = await $fetch('/api/gpt/response', {
        method: 'POST',
        body: {
            message: prompt
                .replace('{unit}', processedUnit)
                .replace('{available_units}', availableUnitsText),
            type: 'quick'
        }
    })

    if (!gptResponse) throw new Error('No response from GPT')
    
    const extractedJson = extractJson(gptResponse)
    if (!extractedJson) throw new Error('No JSON found in GPT response')
    
    const result = JSON.parse(extractedJson)

    if (result.action === 'match') {
        // Convert "whole" back to "" if that's what was chosen
        const finalUnitName = result.unit_name === 'whole' ? '' : result.unit_name
        return { unit_name: finalUnitName }
    }

    // Step 6: Create new unit
    if (result.action === 'create') {
        // Convert "whole" back to "" for database storage
        const dbUnitName = result.unit_name === 'whole' ? '' : result.unit_name
        
        const newCountableUnits = {
            ...countableUnits,
            [dbUnitName]: result.weight_grams
        }

        const { error: updateError } = await supabase
            .from('foods')
            .update({ countable_units: newCountableUnits } as any)
            .eq('id', (foodName as any).food_id)

        if (updateError) {
            throw new Error(`Error updating countable units: ${updateError.message}`)
        }

        return { unit_name: dbUnitName }
    }

    // Fallback - shouldn't reach here
    throw new Error('Invalid GPT response format')
})
