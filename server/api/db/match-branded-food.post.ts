import { serverSupabaseServiceRole } from '#supabase/server';
import extractJson from '~/utils/format/extractJson';
import type { Database } from '~/types/supabase';

/**
 * Match a branded food product to a generic food in the database
 *
 * Input: {
 *   barcode: string
 * }
 *
 * Output: {
 *   status: 'ok' | 'error'
 *   data: {
 *     barcode: string
 *     generic_name: string
 *     confidence: number
 *     matched_food_name_id: number | null
 *   }
 * }
 */
export default defineEventHandler(async (event) => {
  const startTime = Date.now();

  const client = serverSupabaseServiceRole<Database>(event);
  const assets = useStorage('assets:server');

  const input = await readBody(event);
  const { barcode } = input;

  if (!barcode) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Barcode is required',
    });
  }

  try {
    // Step 1: Get the branded food row
    const { data: brandedFood, error: fetchError } = await client
      .from('branded_foods')
      .select('product_name, brand, off_category')
      .eq('barcode', barcode)
      .single();

    if (fetchError || !brandedFood) {
      throw createError({
        statusCode: 404,
        statusMessage: `Branded food with barcode ${barcode} not found`,
      });
    }

    console.log(
      `📦 Processing: ${brandedFood.product_name} (${brandedFood.brand})`
    );

    // Step 2: Load prompt file
    const promptTemplate = (await assets.getItem(
      'branded-food-system/match-branded-food-to-generic-prompt.txt'
    )) as string;

    // Step 3: Format prompt with row info
    const categoryLine = brandedFood.off_category
      ? `The stated category of the product is: ${brandedFood.off_category}`
      : '';

    const prompt = promptTemplate
      .replace('{product_name}', brandedFood.product_name || '')
      .replace('{brand}', brandedFood.brand || '')
      .replace('{category_line}', categoryLine);

    console.log(`⏱️ DB fetch: ${Date.now() - startTime}ms`);

    // Step 4: Call GPT API
    const gptResponse = await $fetch('/api/gpt/response', {
      method: 'POST',
      body: {
        message: prompt,
        type: 'default',
      },
    });

    console.log(`⏱️ GPT call: ${Date.now() - startTime}ms`);

    if (!gptResponse) {
      throw new Error('No response from GPT');
    }

    // Step 5: Extract JSON
    const jsonString = extractJson(gptResponse);
    if (!jsonString) {
      throw new Error('Could not extract JSON from GPT response');
    }

    const result = JSON.parse(jsonString) as {
      generic_name: string;
      confidence: number;
    };

    console.log(
      `🎯 Matched: "${result.generic_name}" (confidence: ${result.confidence})`
    );

    // Step 6: Call request-food endpoint
    const requestFoodResponse = await $fetch('/api/db/request-food', {
      method: 'POST',
      body: {
        query: result.generic_name,
        from_user: false,
      },
    });

    console.log(`⏱️ Request food: ${Date.now() - startTime}ms`);

    const matchedFoodNameId = requestFoodResponse?.data?.id || null;

    // Step 7: Update branded_foods row with matched_food_name_id
    if (matchedFoodNameId) {
      const { error: updateError } = await client
        .from('branded_foods')
        .update({
          matched_food_name_id: matchedFoodNameId,
          matching_confidence: result.confidence,
        })
        .eq('barcode', barcode);

      if (updateError) {
        console.error('Error updating branded_foods:', updateError);
        throw new Error('Failed to update branded_foods table');
      }

      console.log(
        `✅ Updated barcode ${barcode} with matched_food_name_id: ${matchedFoodNameId}`
      );
    }

    console.log(`🎉 Total execution time: ${Date.now() - startTime}ms`);

    return {
      status: 'ok',
      data: {
        barcode,
        generic_name: result.generic_name,
        confidence: result.confidence,
        matched_food_name_id: matchedFoodNameId,
      },
    };
  } catch (error) {
    console.error(`❌ Error processing barcode ${barcode}:`, error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error matching branded food',
      data: {
        error: (error as Error).message,
      },
    });
  }
});
