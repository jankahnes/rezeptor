import { serverSupabaseClient } from '#supabase/server'
import RecipeCalculator from '~/utils/calculation/RecipeCalculator';
import stripKeys from '~/utils/format/stripKeys';
import { recipeKeys } from '~/types/keys';
import convertJsonToEditable from '~/utils/convertToEditable';

type JsonUploadRecipe = {
    title: string;
    ingredients: {
        id: number|null;
        name: string|null;
        amount: number;
        unit: string;
        category: string|null;
        preperation_description: string|null;
    }[];
    instructions: string;
    serves: number;
    batch_size: number|null;
    rating: number|null;
    description: string|null;
    image_base64: string|null;
}


export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event);
  const body = await readBody<JsonUploadRecipe>(event);
  //if any of the id's are null, return error
  for (const ingredient of body.ingredients) {
    if (ingredient.id === null) {
      throw createError({ statusCode: 400, statusMessage: 'All ingredients must have an id' });
    }
  }
  const recipe = await convertJsonToEditable(body, client);
  console.log("🔍 Recipe converted to editable.");

  const recipeCalc = new RecipeCalculator(recipe, true, false, false, true);
  await recipeCalc.computeRecipe();
  console.log("🔍 Recipe computed.");

  const recipeRow = stripKeys(recipeCalc.recipeComputed, recipeKeys);
  const recipeFoodsRows = recipeCalc.getRecipeFoodRows();
  const recipeTagsRows = recipeCalc.getRecipeTagRows();

  const { data, error } = await client
    .from('recipes')
    .insert({
      ...recipeRow,
      user_id: null,
      picture: null,
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

  if (body.image_base64) {
    //make post request to /api/db/upload-image
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
  console.log("🔍 Recipe picture converted and uploaded.");

  console.log("🔍 Recipe foods:", recipeFoodsRows);
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

  console.log(`✅ Recipe uploaded successfully: ${recipeId}, ${body.title}`);
  return {status: 'ok', id: recipeId};
});