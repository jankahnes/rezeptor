import { serverSupabaseClient } from '#supabase/server'
import RecipeCalculator from '~/utils/calculation/RecipeCalculator'
import extractJson from '~/utils/format/extractJson'

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

    const duplicatePrompt = await assets.getItem('duplicate.txt') as string
    const contextPrompt = await assets.getItem('context.txt') as string  
    const generalAminoPrompt = await assets.getItem('general-amino.txt') as string
    const micronutrientsPrompt = await assets.getItem('micronutrients.txt') as string
    logCheckpoint('Prompt files loaded')

    const input = await readBody(event)
    const {food_name} = input
    let id = null;

    try {
        const {data: request, error: requestError} = await client.from('food_requests').insert({food_name: food_name, status: 'PROCESSING'}).select()
        if (requestError) {
            console.error('Error inserting request: ', requestError)
            throw new Error('Error inserting request')
        }
        id = request[0].id;
        logCheckpoint('Request inserted to DB')

        //step 1: use search rpc to find out top 5 potentially similar foods
        const similarFoods = await client.rpc('search_foods', {search_text: food_name})
        if (similarFoods.error) {
            throw new Error('Error searching for similar foods')
        }
        const similarFoodsNames = similarFoods.data.map((food) => food.name).slice(0, 5).join(', ')
        logCheckpoint('Similar foods search completed')

        //step 2: call GPT to find out if the food is a duplicate
        const response = await $fetch('/api/gpt/getResponse', {
            method: 'POST',
            body: {
              systemPrompt: duplicatePrompt,
              message: `New food: ${food_name}\nSimilar foods: ${similarFoodsNames}`,
            },
        });
        if (!response) throw new Error('No content returned from duplicate GPT response');
        logCheckpoint('Duplicate check GPT call completed')

        const match = response.match(/Response:\s*(.*)/s);
        const responseJudgement = match ? match[1].trim() : null;
        if (responseJudgement === 'not_a_food') {
            throw new Error('Not a food')
        }
        else if (responseJudgement !== 'not_a_duplicate') {
            throw new Error(responseJudgement)
        }

        //step 3: use GPT to fill in fields from food name - PARALLELIZED
        const [generalAminoResponse, contextResponse, micronutrientsResponse] = await Promise.all([
            $fetch('/api/gpt/getResponse', {
                method: 'POST',
                body: {
                  systemPrompt: generalAminoPrompt,
                  message: `Food: ${food_name}`,
                },
            }),
            $fetch('/api/gpt/getResponse', {
                method: 'POST',
                body: {
                  systemPrompt: contextPrompt,
                  message: `Food: ${food_name}`,
                },
            }),
            $fetch('/api/gpt/getResponse', {
                method: 'POST',
                body: {
                  systemPrompt: micronutrientsPrompt,
                  message: `Food: ${food_name}`,
                },
            })
        ]);
        logCheckpoint('All 3 parallel GPT calls completed')
        
        if (!generalAminoResponse || !contextResponse || !micronutrientsResponse) throw new Error('No content returned from a GPT response');
        const generalAmino = JSON.parse(extractJson(generalAminoResponse))
        const context = JSON.parse(extractJson(contextResponse))
        const micronutrients = JSON.parse(extractJson(micronutrientsResponse))
        logCheckpoint('GPT responses parsed')

        const foodObject = {
            name: food_name,
            ...generalAmino,
            ...context,
            ...micronutrients,
        }
        logCheckpoint('Food object created')

        //step 4: make a RecipeCalculator object to calculate health metrics, apply to food object
        const recipeCalculator = new RecipeCalculator(foodObject, false, false, true)
        logCheckpoint('RecipeCalculator instantiated')
        
        const healthMetrics = await recipeCalculator.getScoring()
        logCheckpoint('Health metrics calculated (RecipeCalculator.getScoring)')
        
        Object.assign(foodObject, healthMetrics)
        delete foodObject.processing_level_score
        delete foodObject.water
        logCheckpoint('Food object finalized')
        
        //step 5: insert food object into foods table
        const {data, error} = await client.from('foods').insert(foodObject).select()
        if (error) throw new Error('Error inserting food into foods table: ' + error.message)
        const newFoodId = data?.[0]?.id
        logCheckpoint('Food inserted to database')
        
        await client.from('food_requests').update({status: 'CLOSED_INSERTED', new_food_id: newFoodId}).eq('id', id)
        logCheckpoint('Request status updated')
        
        const totalTime = Date.now() - startTime
        console.log(`🎉 Total execution time: ${totalTime}ms`)
        
        return {status: 'ok', data: {new_food_id: newFoodId, status: 'CLOSED_INSERTED'}}
    } catch (error) {
        const totalTime = Date.now() - startTime
        console.log(`❌ Error after ${totalTime}ms:`, error)
        await client.from('food_requests').update({status: 'CLOSED_NOT_INSERTED', status_info: error.message}).eq('id', id)
        throw createError({
            statusCode: 500,
            statusMessage: 'Error in on-request-insert',
            data: {status: 'CLOSED_NOT_INSERTED', status_info: error.message}
        })
    }
})