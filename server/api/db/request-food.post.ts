import { serverSupabaseClient } from '#supabase/server'
import extractJson from '~/utils/format/extractJson'
import pluralizeWord from '~/utils/format/pluralizeWord'
import pluralize from 'pluralize'


/**
 * Input: {
 * query: String
 * from_user: Boolean
 * }
 * 
 * Output: {
 * action_taken: "found" | "insert_as_new" | "insert_as_alias" | "reject"
 * id: Int | null
 * }
 */
export default defineEventHandler(async (event) => {
    const startTime = Date.now()
    let checkpointTime = startTime
    
    const logCheckpoint = (label: string) => {
        const now = Date.now()
        const elapsed = now - checkpointTime
        const total = now - startTime
        console.log(`⏱️ ${label}: +${elapsed}ms (total: ${total}ms)`)
        checkpointTime = now
    }

    const client = await serverSupabaseClient(event)
    logCheckpoint('Supabase client created')
    
    const assets = useStorage('assets:server')

    const matchSimilarityThreshold = 0.9

    const searchPrompt = await assets.getItem('food-match/search_related.txt') as string
    const judgePrompt = await assets.getItem('food-match/judge_results.txt') as string
    
    logCheckpoint('Prompt files loaded')

    const input = await readBody(event)
    let {query, from_user} = input
    let request_id = null;

    try {
        if(from_user) {
        const {data: request, error: requestError} = await client.from('food_requests').insert({food_name: query, status: 'PROCESSING'}).select()
        if (requestError) {
            console.error('Error inserting request: ', requestError)
            throw new Error('Error inserting request')
        }
        request_id = request[0].id;
        logCheckpoint('Request inserted to DB')
    }

        //step 1: use search rpc to find if there is an exact match
        //first try singular form (either original query singularized, or original if already singular)
        const singularQuery = pluralize.singular(query)
        const exactMatchSingular = await client.rpc('search_foods', {query: singularQuery, max: 1}) as {data: {food: {name: string, id: number}, best_similarity: number}[]}
        if (exactMatchSingular.error) {
            throw new Error('Error searching for similar foods (singular): ' + exactMatchSingular.error.message)
        }
        const matchingFoodSingular = exactMatchSingular.data?.[0]
        //if there is an exact match with singular, return the id
        if (matchingFoodSingular?.best_similarity > matchSimilarityThreshold) {
            logCheckpoint('Exact match found (singular)')
            if(from_user) {
                await client.from('food_requests').update({status: 'REJECTED', status_info: 'Exact match found', food_name_id: matchingFoodSingular?.food?.id}).eq('id', request_id)
            }
            console.log(`🎉 Total execution time: ${Date.now() - startTime}ms`)
            return {status: 'ok', data: {action_taken: 'found', id: matchingFoodSingular?.food?.id}}
        }
        
        //if no singular match, try plural form
        const pluralQuery = pluralizeWord(query)
        const exactMatchPlural = await client.rpc('search_foods', {query: pluralQuery, max: 1}) as {data: {food: {name: string, id: number}, best_similarity: number}[]}
        if (exactMatchPlural.error) {
            throw new Error('Error searching for similar foods (plural): ' + exactMatchPlural.error.message)
        }
        const matchingFoodPlural = exactMatchPlural.data?.[0]
        //if there is an exact match with plural, return the id
        if (matchingFoodPlural?.best_similarity > matchSimilarityThreshold) {
            logCheckpoint('Exact match found (plural)')
            if(from_user) {
                await client.from('food_requests').update({status: 'REJECTED', status_info: 'Exact match found', food_name_id: matchingFoodPlural?.food?.id}).eq('id', request_id)
            }
            console.log(`🎉 Total execution time: ${Date.now() - startTime}ms`)
            return {status: 'ok', data: {action_taken: 'found', id: matchingFoodPlural?.food?.id}}
        }
        //if there is no exact match, call GPT to generate alternative search queries
        logCheckpoint('Generating alternative search queries')
        const response = await $fetch('/api/gpt/response', {
            method: 'POST',
            body: {
              message: searchPrompt.replace('{query}', query),
              type: 'quick'
            },
        });
        if (!response) throw new Error('No content returned from search GPT response');
        logCheckpoint('Search GPT call completed')
        const searchResults = JSON.parse(extractJson(response)) as {search_terms: string[]}
        if (!searchResults) throw new Error('No content returned from search GPT response');
        let relevantFoods = []
        if (matchingFoodSingular) {
            relevantFoods.push(matchingFoodSingular)
        }
        if (matchingFoodPlural) {
            relevantFoods.push(matchingFoodPlural)
        }
        for (const searchTerm of searchResults.search_terms) {
            const similarFoods = await client.rpc('search_foods_deduplicated', {query: searchTerm, max: 3}) as {data: {food: {name: string, id: number}, best_similarity: number}[]}
            if (similarFoods.error) {
                throw new Error('Error searching for similar foods')
            }
            relevantFoods.push(...similarFoods.data)
        }
        logCheckpoint('Similar foods search completed')
        //deduplicate by ID, sort by similarity, cut off at 10 results
        relevantFoods.sort((a, b) => b.best_similarity - a.best_similarity)
        relevantFoods = relevantFoods.filter((food, index, self) =>
            index === self.findIndex((t) => t.food.food_id === food.food.food_id)
        )
        relevantFoods = relevantFoods.slice(0, 10)
        const relevantFoodsNames = relevantFoods.map((food) => `"Name: ${food.food.name} / ID: ${food.food.food_id} / Kcal/100g: ${food.food.kcal}"`).join(' ;\n ')

        //after getting potentially relevant foods, call GPT to judge what to do with the food
        const judgeResponse = await $fetch('/api/gpt/response', {
            method: 'POST',
            body: {
              message: judgePrompt.replace('{query}', query).replace('{results}', relevantFoodsNames),
              type: 'default'
            },
        });
        logCheckpoint('Judge GPT call completed')
        if (!judgeResponse) throw new Error('No content returned from judge GPT response');
        const judgeResults = JSON.parse(extractJson(judgeResponse)) as {query_formatted: string, judgement: 'add_as_alias' | 'add_as_new' | 'reject', matching_id: number | null, primary_name: string | null}

        if (judgeResults.judgement === 'reject') {
            logCheckpoint('Reject judgement')
        console.log(`🎉 Total execution time: ${Date.now() - startTime}ms`)
            return {status: 'ok', data: {action_taken: 'reject'}}
        }
        if (judgeResults.judgement === 'add_as_alias') {
            const {data: foodNameData, error: foodNameError} = await client.from('food_names').insert({food_id: judgeResults.matching_id, name: judgeResults.query_formatted, is_primary: false}).select()
            if(foodNameError) throw new Error('Error inserting food name into food_names table: ' + foodNameError.message)
            const newFoodNameId = foodNameData?.[0]?.id
            if(from_user) {
                await client.from('food_requests').update({status: 'ALIAS_INSERTED', status_info: `Accepted as alias`, food_name_id: newFoodNameId}).eq('id', request_id)
            }
            else {
                await client.from('food_requests').insert({status: 'ALIAS_INSERTED', status_info: `Accepted as alias}`, food_name_id: newFoodNameId})
            }
            logCheckpoint('Alias inserted to database')
            console.log(`🎉 Total execution time: ${Date.now() - startTime}ms`)
            return {status: 'ok', data: {action_taken: 'insert_as_alias', id: newFoodNameId}}
        }

        //Else, we need to insert the food as a new food
        let primaryName = judgeResults.primary_name ?? judgeResults.query_formatted
        const contextPrompt = await assets.getItem('food-create/context.txt') as string  
        const generalAminoPrompt = await assets.getItem('food-create/general-amino.txt') as string
        const micronutrientsPrompt = await assets.getItem('food-create/micronutrients.txt') as string
        const unitsPrompt = await assets.getItem('food-create/units_and_aisle.txt') as string
        //step 3: use GPT to fill in fields from food name
        const [generalAminoResponse, contextResponse, micronutrientsResponse, unitsResponse] = await Promise.all([
            $fetch('/api/gpt/response', {
                method: 'POST',
                body: {
                  systemPrompt: generalAminoPrompt,
                  message: `Food: ${primaryName}`,
                  type: 'accurate'
                },
            }),
            $fetch('/api/gpt/response', {
                method: 'POST',
                body: {
                  systemPrompt: contextPrompt,
                  message: `Food: ${primaryName}`,
                  type: 'accurate'
                },
            }),
            $fetch('/api/gpt/response', {
                method: 'POST',
                body: {
                  systemPrompt: micronutrientsPrompt,
                  message: `Food: ${primaryName}`,
                  type: 'accurate'
                },
            }),
            $fetch('/api/gpt/response', {
                method: 'POST',
                body: {
                  systemPrompt: unitsPrompt,
                  message: `Food: ${primaryName}`,
                  type: 'accurate'
                },
            })
        ]);
        logCheckpoint('All 4 parallel GPT calls completed')
        
        if (!generalAminoResponse || !contextResponse || !micronutrientsResponse) throw new Error('No content returned from a GPT response');
        const generalAmino = JSON.parse(extractJson(generalAminoResponse))
        const context = JSON.parse(extractJson(contextResponse))
        const micronutrients = JSON.parse(extractJson(micronutrientsResponse))
        const units = JSON.parse(extractJson(unitsResponse))
        logCheckpoint('GPT responses parsed')

        const foodObject = {
            name: primaryName,
            ...generalAmino,
            ...context,
            ...micronutrients,
            ...units,
        }
        logCheckpoint('Food object created')

        const calculatorArgs = {
            recipe: foodObject,
            useGpt: false,
            logToReport: false,
            isFood: true,
            considerProcessing: false,
        }
        const nutritionResponse = await $fetch('/api/calculate/nutrition', {
            method: 'POST',
            body: {
                calculatorArgs: calculatorArgs,
            },
        });
        const healthMetrics = nutritionResponse.nutrition;
        
        Object.assign(foodObject, healthMetrics)
        foodObject.primary_name = foodObject.name
        delete foodObject.name
        delete foodObject.processing_level_score
        delete foodObject.water
        logCheckpoint('Food object finalized')
        
        //step 5: insert food object into foods table
        let newFoodNameId = null;
        
        const {data: foodData, error: foodError} = await client.from('foods').insert(foodObject).select()
        if (foodError) throw new Error('Error inserting food into foods table: ' + foodError.message)
        
        const {data: foodNameData, error: foodNameError} = await client.from('food_names').insert({food_id: foodData?.[0]?.id, name: primaryName, is_primary: true}).select()
        if(foodNameError) throw new Error('Error inserting food name into food_names table: ' + foodNameError.message)
        newFoodNameId = foodNameData?.[0]?.id

        if(judgeResults.primary_name && judgeResults.query_formatted !== primaryName) {
        const {data: foodNameData, error: foodNameError} = await client.from('food_names').insert({food_id: foodData?.[0]?.id, name: judgeResults.query_formatted, is_primary: false}).select()
        if(foodNameError) throw new Error('Error inserting food name into food_names table: ' + foodNameError.message)
        newFoodNameId = foodNameData?.[0]?.id
        }
        
        logCheckpoint('Food inserted to database')

        if(from_user) {
        await client.from('food_requests').update({status: 'CLOSED_INSERTED', food_name_id: newFoodNameId}).eq('id', request_id)
        }
        else {
            await client.from('food_requests').insert({status: 'CLOSED_INSERTED', food_name_id: newFoodNameId, food_name: query})
        }
        logCheckpoint('Request status updated')
        
        console.log(`🎉 Total execution time: ${Date.now() - startTime}ms`)
        
        return {status: 'ok', data: {id: newFoodNameId, action_taken: 'insert_as_new'}}
    } catch (error) {
        console.log(`❌ Error after ${Date.now() - startTime}ms:`, error)
        await client.from('food_requests').update({status: 'CLOSED_NOT_INSERTED', status_info: error.message}).eq('id', request_id)
        throw createError({
            statusCode: 500,
            statusMessage: 'Error in on-request-insert',
            data: {status: 'CLOSED_NOT_INSERTED', status_info: error.message}
        })
    }
})