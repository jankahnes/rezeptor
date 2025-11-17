import { serverSupabaseServiceRole } from '#supabase/server';
import type { Database } from '~/types/supabase';
import removeInstructionFormatting from '~/utils/format/removeInstructionFormatting';

export default defineEventHandler(async (event) => {
  // Verify this is coming from Vercel Cron (they send CRON_SECRET automatically)
  const authHeader = getHeader(event, 'authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  const client = serverSupabaseServiceRole<Database>(event);

  try {
    // Fetch top 20 recipes sorted by relevancy
    const { data: allRecipes, error } = await client
      .from('recipes')
      .select('id, title, instructions, collection, picture')
      .order('relevancy', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching recipes:', error);
      throw error;
    }

    if (!allRecipes || allRecipes.length === 0) {
      return {
        success: true,
        message: 'No recipes found',
        processed: 0,
      };
    }

    // Filter to only recipes without pictures
    const recipes = allRecipes.filter((recipe) => !recipe.picture);

    if (recipes.length === 0) {
      return {
        success: true,
        message: 'All top 20 recipes already have pictures',
        processed: 0,
      };
    }

    console.log(
      `Processing ${recipes.length} out of top 20 recipes without pictures`
    );

    const results = {
      processed: 0,
      failed: 0,
      errors: [] as Array<{ recipeId: number; error: string }>,
    };

    // Process recipes sequentially to avoid overwhelming the external API
    for (const recipe of recipes) {
      try {
        console.log(
          `Generating picture for recipe ${recipe.id}: ${recipe.title}`
        );

        // Generate image from recipe data
        const imageGenerationData = {
          title: recipe.title,
          instructions: removeInstructionFormatting(recipe.instructions || []),
          collection: recipe.collection || 'user-generated',
        };

        const imageResponse = await fetch(
          'https://jk-api.onrender.com/generate-image-from-recipe-data',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(imageGenerationData),
          }
        );

        if (!imageResponse.ok) {
          throw new Error(
            `Image generation failed: ${imageResponse.statusText}`
          );
        }

        const generatedImageBuffer = await imageResponse.arrayBuffer();
        const generatedImageBase64 = `data:image/png;base64,${Buffer.from(
          generatedImageBuffer
        ).toString('base64')}`;

        // Upload the generated image
        const uploadResponse = await fetch(
          `${getRequestURL(event).origin}/api/db/upload-image`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              image: generatedImageBase64,
              bucket: 'recipe',
              id: recipe.id.toString(),
            }),
          }
        );

        if (!uploadResponse.ok) {
          throw new Error(`Image upload failed: ${uploadResponse.statusText}`);
        }

        const imageData = await uploadResponse.json();

        // Update recipe with the new picture URL
        const { error: updateError } = await client
          .from('recipes')
          .update({ picture: imageData.publicUrl })
          .eq('id', recipe.id);

        if (updateError) {
          throw new Error(`Database update failed: ${updateError.message}`);
        }

        console.log(`Successfully generated picture for recipe ${recipe.id}`);
        results.processed++;

        // Add a small delay between requests to be respectful to the external API
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error: any) {
        console.error(
          `Failed to generate picture for recipe ${recipe.id}:`,
          error
        );
        results.failed++;
        results.errors.push({
          recipeId: recipe.id,
          error: error.message || 'Unknown error',
        });
        // Continue with next recipe even if this one failed
      }
    }

    return {
      success: true,
      message: `Processed ${results.processed} recipes, ${results.failed} failed`,
      ...results,
    };
  } catch (error: any) {
    console.error('Cron job error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to process recipes',
    });
  }
});
