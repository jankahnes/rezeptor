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
    rating: number|null;
    description: string|null;
    image_url: string|null;
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
  const recipeCalc = new RecipeCalculator(recipe, true, false, false, true);
  await recipeCalc.computeRecipe();

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
  if (error) throw error;

  if (body.image_url) {
    //make post request to /api/db/upload-image
    const imageData = await $fetch('/api/db/upload-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: { image: body.image_url, bucket: 'recipe', id: data!.id },
    });
    const pictureUrl = imageData.publicUrl;
    if (!pictureUrl) return;
    const { error: updateError } = await client
      .from('recipes')
      .update({ picture: pictureUrl } as any)
      .eq('id', data!.id);
    if (updateError) throw updateError;
  }

  await client
  .from('recipe_foods')
  .insert(recipeFoodsRows.map((obj) => ({ ...obj, recipe_id: data!.id })) as any);

  await client
  .from('recipe_tags')
  .insert(recipeTagsRows.map((obj) => ({ ...obj, recipe_id: data!.id })) as any);

  console.log(`✅ Recipe uploaded successfully: ${data!.id}, ${body.title}`);
  return {status: 'ok', id: data!.id};
});