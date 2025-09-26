import { serverSupabaseClient } from '#supabase/server'
import stripKeys from '~/utils/format/stripKeys';
import { recipeKeys } from '~/types/keys';
import type { UploadableRecipeInformation } from '~/types/exports';
import convertUploadableToEditable from '~/server/utils/convertUploadableToEditable';

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
async function handleImageUpload(client: any, recipeId: number, body: any): Promise<void> {
  if (body.image_base64) {
    const imageData = await $fetch('/api/db/upload-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: { image: body.image_base64, bucket: 'recipe', id: recipeId },
    });
    const pictureUrl = imageData.publicUrl;
    if (!pictureUrl) {
      console.error("🔍 Failed to get picture URL");
      throw createError({ statusCode: 500, statusMessage: 'Failed to get picture URL' });
    }
    const { error: updateError } = await client
      .from('recipes')
      .update({ picture: pictureUrl } as never)
      .eq('id', recipeId);
    if (updateError) {
      console.error("🔍 Error updating recipe picture:", updateError);
      throw createError({ statusCode: 500, statusMessage: 'Failed to update recipe picture' });
    }
  }

  if (body.original_base64) {
    $fetch('/api/db/upload-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: { image: body.original_base64, bucket: 'backups', id: recipeId },
    });
  }
  console.log("🔍 Recipe picture converted and uploaded.");
}

// Function to insert a new recipe
async function insertNewRecipe(client: any, recipeRow: any, recipeFoodsRows: any[], recipeTagsRows: any[], body: any): Promise<number> {
  const { data, error } = await client
    .from('recipes')
    .insert({
      ...recipeRow,
      picture: null,
      visibility: body.publish ? 'PUBLIC' : 'UNLISTED',
    } as any)
    .select('id')
    .single();
  
  if (error) {
    console.error("🔍 Error inserting recipe:", error);
    throw createError({ statusCode: 500, statusMessage: 'Failed to insert recipe' });
  }
  console.log("🔍 Recipe inserted.");

  const recipeId = (data as { id: number })?.id;
  if (!recipeId) {
    console.error("🔍 Failed to get recipe ID");
    throw createError({ statusCode: 500, statusMessage: 'Failed to get recipe ID' });
  }

  await handleImageUpload(client, recipeId, body);

  const { error: recipeFoodsError } = await client
    .from('recipe_foods')
    .insert(recipeFoodsRows.map((obj) => ({ ...obj, recipe_id: recipeId })) as any);

  const { error: recipeTagsError } = await client
    .from('recipe_tags')
    .insert(recipeTagsRows.map((obj) => ({ ...obj, recipe_id: recipeId })) as any);

  if (recipeFoodsError) {
    console.error("🔍 Error inserting recipe foods:", recipeFoodsError);
    throw createError({ statusCode: 500, statusMessage: 'Failed to insert recipe foods' });
  }
  if (recipeTagsError) {
    console.error("🔍 Error inserting recipe tags:", recipeTagsError);
    throw createError({ statusCode: 500, statusMessage: 'Failed to insert recipe tags' });
  }
  console.log("🔍 Recipe foods and tags inserted.");

  return recipeId;
}

// Function to update an existing recipe
async function updateExistingRecipe(client: any, recipeRow: any, recipeFoodsRows: any[], recipeTagsRows: any[], body: any): Promise<number> {
  const recipeId = (recipeRow as any).id;

  const { error: updateError } = await client
    .from('recipes')
    .update({
      ...recipeRow,
      visibility: body.publish ? 'PUBLIC' : 'UNLISTED',
    } as any)
    .eq('id', recipeId);

  if (updateError) {
    console.error("🔍 Error updating recipe:", updateError);
    throw createError({ statusCode: 500, statusMessage: 'Failed to update recipe' });
  }
  console.log("🔍 Recipe updated.");

  await handleImageUpload(client, recipeId, body);

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
    console.error("🔍 Error deleting existing recipe foods:", deleteFoodsError);
    throw createError({ statusCode: 500, statusMessage: 'Failed to delete existing recipe foods' });
  }
  if (deleteTagsError) {
    console.error("🔍 Error deleting existing recipe tags:", deleteTagsError);
    throw createError({ statusCode: 500, statusMessage: 'Failed to delete existing recipe tags' });
  }

  // Insert new recipe_foods and recipe_tags
  const { error: recipeFoodsError } = await client
    .from('recipe_foods')
    .insert(recipeFoodsRows.map((obj) => ({ ...obj, recipe_id: recipeId })) as any);

  const { error: recipeTagsError } = await client
    .from('recipe_tags')
    .insert(recipeTagsRows.map((obj) => ({ ...obj, recipe_id: recipeId })) as any);

  if (recipeFoodsError) {
    console.error("🔍 Error inserting recipe foods:", recipeFoodsError);
    throw createError({ statusCode: 500, statusMessage: 'Failed to insert recipe foods' });
  }
  if (recipeTagsError) {
    console.error("🔍 Error inserting recipe tags:", recipeTagsError);
    throw createError({ statusCode: 500, statusMessage: 'Failed to insert recipe tags' });
  }
  console.log("🔍 Recipe foods and tags updated.");

  return recipeId;
}

//Uploads a recipe from UploadableRecipeInformation object
export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event);
  const body = await readBody<UploadableRecipeInformation & {jobId: string, ingredients_editable: any|null|undefined}>(event);
  const isEditable = body.ingredients_editable && body.ingredients_editable.ingredients.length && !body.useNaturalLanguage;
  if(!isEditable) {
  for (const ingredient of body.ingredients) {
    if (ingredient.id === null) {
      throw createError({ statusCode: 400, statusMessage: 'All ingredients must have an id' });
    }
  }
  }
  let recipe;
  if(!isEditable) {
    recipe = await convertUploadableToEditable(body, client);
  } else {
    recipe = body;
  }
  console.log("🔍 Recipe converted to editable.");
  const calculatorArgs = {
    recipe: recipe,
    useGpt: false,
    logToReport: true,
    isFood: false,
    considerProcessing: false,
  }
  if(body.uploading_protocol === "accurate") {
    calculatorArgs.useGpt = true;
  } else if((body.uploading_protocol === "full" || body.publish )&& !body.processing_requirements?.full_nutri_processing) {
    calculatorArgs.useGpt = true;
    calculatorArgs.considerProcessing = true;
    body.processing_requirements!.full_nutri_processing = true;
  }

  const response = await $fetch('/api/calculate/recipe', {
    method: 'POST',
    body: {
      calculatorArgs: calculatorArgs,
    },
  });

  console.log("🔍 Recipe computed.");
  if(body.jobId) {
    await (client.from('jobs') as any).update({
      step_index: 6,
      updated_at: new Date()
    }).eq('id', body.jobId);
  }

  const recipeRow = stripKeys(response.recipeComputed, recipeKeys);
  const recipeFoodsRows = response.recipeFoodRows;
  const recipeTagsRows = response.recipeTagRows;

  // Determine if we should update existing recipe or insert new one
  const shouldUpdate = (recipeRow as any).id && await recipeExists(client, (recipeRow as any).id);
  
  let recipeId: number;
  if (shouldUpdate) {
    console.log(`🔍 Updating existing recipe: ${(recipeRow as any).id}`);
    recipeId = await updateExistingRecipe(client, recipeRow, recipeFoodsRows, recipeTagsRows, body);
  } else {
    console.log("🔍 Creating new recipe");
    recipeId = await insertNewRecipe(client, recipeRow, recipeFoodsRows, recipeTagsRows, body);
  }

  console.log(`✅ Recipe ${shouldUpdate ? 'updated' : 'uploaded'} successfully: ${recipeId}, ${body.title}`);
  return {status: 'ok', id: recipeId};
});