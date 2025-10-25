import {
  serverSupabaseServiceRole,
  serverSupabaseUser,
} from '#supabase/server';
import type { ComputableRecipe, InsertableRecipe } from '~/types/types';
import convertUploadableToComputable from '~/server/utils/convertUploadableToComputable';
import type { Database } from '~/types/supabase';

// Helper function to check if recipe exists in database
async function recipeExists(client: any, recipeId: number): Promise<boolean> {
  const { data, error } = await client
    .from('recipes')
    .select('id')
    .eq('id', recipeId)
    .single();

  return !error && !!data;
}

// Helper function to handle image upload
async function handleImageUpload(
  client: any,
  recipeId: number,
  body: any,
  event: any
): Promise<void> {
  if (body.image_base64) {
    const headers = getRequestHeaders(event);
    const imageData = await $fetch('/api/db/upload-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: headers.cookie || '',
        authorization: headers.authorization || '',
      },
      body: { image: body.image_base64, bucket: 'recipe', id: recipeId },
    });
    const pictureUrl = imageData.publicUrl;
    if (!pictureUrl) {
      console.error('🔍 Failed to get picture URL');
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to get picture URL',
      });
    }
    const { error: updateError } = await client
      .from('recipes')
      .update({ picture: pictureUrl } as never)
      .eq('id', recipeId);
    if (updateError) {
      console.error('🔍 Error updating recipe picture:', updateError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update recipe picture',
      });
    }
  }

  if (body.original_base64) {
    const headers = getRequestHeaders(event);
    $fetch('/api/db/upload-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: headers.cookie || '',
        authorization: headers.authorization || '',
      },
      body: { image: body.original_base64, bucket: 'backups', id: recipeId },
    });
  }
  console.log('🔍 Recipe picture converted and uploaded.');
}

// Function to insert a new recipe
async function insertNewRecipe(
  client: any,
  recipeRow: any,
  recipeFoodsRows: any[],
  recipeTagsRows: any[],
  body: any,
  userId: string | null,
  event: any
): Promise<number> {
  const { data, error } = await client
    .from('recipes')
    .insert({
      ...recipeRow,
      picture: null,
      visibility: body.publish ? 'PUBLIC' : 'UNLISTED',
      user_id: userId, // Set the owner
    } as any)
    .select('id')
    .single();

  if (error) {
    console.error('🔍 Error inserting recipe:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to insert recipe',
    });
  }
  console.log('🔍 Recipe inserted.');

  const recipeId = (data as { id: number })?.id;
  if (!recipeId) {
    console.error('🔍 Failed to get recipe ID');
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get recipe ID',
    });
  }

  await handleImageUpload(client, recipeId, body, event);

  const { error: recipeFoodsError } = await client
    .from('recipe_foods')
    .insert(
      recipeFoodsRows.map((obj) => ({ ...obj, recipe_id: recipeId })) as any
    );

  const { error: recipeTagsError } = await client
    .from('recipe_tags')
    .insert(
      recipeTagsRows.map((obj) => ({ ...obj, recipe_id: recipeId })) as any
    );

  if (recipeFoodsError) {
    console.error('🔍 Error inserting recipe foods:', recipeFoodsError);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to insert recipe foods',
    });
  }
  if (recipeTagsError) {
    console.error('🔍 Error inserting recipe tags:', recipeTagsError);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to insert recipe tags',
    });
  }
  console.log('🔍 Recipe foods and tags inserted.');

  return recipeId;
}

// Function to update an existing recipe
async function updateExistingRecipe(
  client: any,
  recipeRow: any,
  recipeFoodsRows: any[],
  recipeTagsRows: any[],
  body: any,
  userId: string | null,
  event: any
): Promise<number> {
  const recipeId = (recipeRow as any).id;

  // Check ownership before allowing update
  const { data: existingRecipe, error: fetchError } = await client
    .from('recipes')
    .select('user_id')
    .eq('id', recipeId)
    .single();

  if (fetchError || !existingRecipe) {
    console.error('🔍 Recipe not found:', fetchError);
    throw createError({ statusCode: 404, statusMessage: 'Recipe not found' });
  }

  if (existingRecipe.user_id !== userId) {
    console.log(
      `🔍 User is not recipe owner. Creating new version of recipe ${recipeId} with based_on field.`
    );
    // Create a new recipe version instead of updating
    const newRecipeRow = { ...recipeRow };
    delete (newRecipeRow as any).id; // Remove the id so a new one is generated
    (newRecipeRow as any).based_on = recipeId; // Set based_on to the original recipe ID

    return await insertNewRecipe(
      client,
      newRecipeRow,
      recipeFoodsRows,
      recipeTagsRows,
      body,
      userId,
      event
    );
  }

  const { error: updateError } = await client
    .from('recipes')
    .update({
      ...recipeRow,
      visibility: body.publish ? 'PUBLIC' : 'UNLISTED',
    } as any)
    .eq('id', recipeId);

  if (updateError) {
    console.error('🔍 Error updating recipe:', updateError);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update recipe',
    });
  }
  console.log('🔍 Recipe updated.');

  await handleImageUpload(client, recipeId, body, event);

  // Delete existing recipe_foods and recipe_tags
  const { error: deleteFoodsError } = await client
    .from('recipe_foods')
    .delete()
    .eq('recipe_id', recipeId);

  const { error: deleteTagsError } = await client
    .from('recipe_tags')
    .delete()
    .eq('recipe_id', recipeId);

  if (deleteFoodsError) {
    console.error('🔍 Error deleting existing recipe foods:', deleteFoodsError);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete existing recipe foods',
    });
  }
  if (deleteTagsError) {
    console.error('🔍 Error deleting existing recipe tags:', deleteTagsError);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete existing recipe tags',
    });
  }

  // Insert new recipe_foods and recipe_tags
  const { error: recipeFoodsError } = await client
    .from('recipe_foods')
    .insert(
      recipeFoodsRows.map((obj) => ({ ...obj, recipe_id: recipeId })) as any
    );

  const { error: recipeTagsError } = await client
    .from('recipe_tags')
    .insert(
      recipeTagsRows.map((obj) => ({ ...obj, recipe_id: recipeId })) as any
    );

  if (recipeFoodsError) {
    console.error('🔍 Error inserting recipe foods:', recipeFoodsError);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to insert recipe foods',
    });
  }
  if (recipeTagsError) {
    console.error('🔍 Error inserting recipe tags:', recipeTagsError);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to insert recipe tags',
    });
  }
  console.log('🔍 Recipe foods and tags updated.');

  return recipeId;
}

//Uploads a recipe from UploadableRecipeInformation object
export default defineEventHandler(async (event) => {
  let userId: string | null = null;
  try {
    const user = await serverSupabaseUser(event);
    userId = user?.id || null;
  } catch (error) {
    console.log('No auth session, proceeding with null userId');
  }

  const client = serverSupabaseServiceRole<Database>(event);
  const body: ComputableRecipe & { full: Boolean } = await readBody(event);

  const calculatorArgs = {
    recipe: body,
    useGpt: false,
    logToReport: true,
    isFood: false,
    considerProcessing: false,
  };

  if (body.full) {
    calculatorArgs.useGpt = true;
    calculatorArgs.considerProcessing = true;
  }
  const response = (await $fetch('/api/calculate/recipe', {
    method: 'POST',
    body: {
      calculatorArgs: calculatorArgs,
    },
  })) satisfies {
    recipeRow: InsertableRecipe;
    recipeFoodRows: any[];
    recipeTagRows: any[];
  };

  if (body.full) {
    response.recipeRow.visibility = 'PUBLIC';
  } else {
    response.recipeRow.visibility = 'UNLISTED';
  }
  delete response.recipeRow.picture;

  // Determine if we should update existing recipe or insert new one
  const shouldUpdate =
    (response.recipeRow as any).id &&
    (await recipeExists(client, (response.recipeRow as any).id));

  let recipeId: number;
  if (shouldUpdate) {
    console.log(
      `🔍 Updating existing recipe: ${(response.recipeRow as any).id}`
    );
    recipeId = await updateExistingRecipe(
      client,
      response.recipeRow,
      response.recipeFoodRows,
      response.recipeTagRows,
      body,
      userId,
      event
    );
  } else {
    console.log('🔍 Creating new recipe');
    recipeId = await insertNewRecipe(
      client,
      response.recipeRow,
      response.recipeFoodRows,
      response.recipeTagRows,
      body,
      userId,
      event
    );
  }

  console.log(
    `✅ Recipe ${
      shouldUpdate ? 'updated' : 'uploaded'
    } successfully: ${recipeId}, ${body.title}`
  );
  return { status: 'ok', id: recipeId };
});
