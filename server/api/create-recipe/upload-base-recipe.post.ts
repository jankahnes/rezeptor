import {
  serverSupabaseServiceRole,
  serverSupabaseUser,
} from '#supabase/server';
import type { Database } from '~/types/supabase';
import type { BaseRecipe, UploadableRecipe } from '~/types/types';
import { recipeKeys } from '~/types/keys';
import stripKeys from '~/utils/format/stripKeys';
import type { InsertableRecipe } from '~/types/types';
import cleanUrl from '~/utils/cleanUrl';

async function uploadImage(
  recipeId: number,
  imageBase64: string,
  headers: any
) {
  const imageData = await $fetch('/api/db/upload-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: headers.cookie || '',
      authorization: headers.authorization || '',
    },
    body: { image: imageBase64, bucket: 'recipe', id: recipeId },
  });
  const pictureUrl = imageData.publicUrl;
  if (!pictureUrl) {
    console.error('🔍 Failed to upload image');
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to upload image',
    });
  }
  return pictureUrl;
}



//Uploads a recipe from BaseRecipeInformation object
export default defineEventHandler(async (event) => {
  let userId: string | null = null;
  try {
    const user = await serverSupabaseUser(event);
    userId = user?.id || null;
  } catch (error) {
    console.log('No auth session, proceeding with null userId');
  }

  const client = serverSupabaseServiceRole<Database>(event);
  const { baseRecipe }: { baseRecipe: InsertableRecipe & BaseRecipe } =
    await readBody(event);

  const { data, error } = await client
    .from('recipes')
    .insert(
      stripKeys(
        {
          ...baseRecipe,
          user_id: userId,
          base_ingredients_serves: baseRecipe.serves,
          visibility: 'UNLISTED',
          source: cleanUrl(baseRecipe.source),
        },
        recipeKeys
      ) as InsertableRecipe
    )
    .select()
    .single();

  if (!data?.id || error) {
    console.error('🔍 Error uploading recipe:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to upload recipe',
    });
  }

  if (baseRecipe.original_image_base64) {
    const { image_base64 }: { image_base64: string } = await $fetch(
      '/api/create-recipe/get-processed-image',
      {
        method: 'POST',
        body: baseRecipe,
      }
    );
    baseRecipe.picture = await uploadImage(
      data.id,
      image_base64,
      getRequestHeaders(event)
    );
    const { error: updateError } = await client
      .from('recipes')
      .update({ picture: baseRecipe.picture })
      .eq('id', data.id);
    if (updateError) {
      console.error('🔍 Error updating recipe picture:', updateError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update recipe picture',
      });
    }
  }

  if (error) {
    console.error('🔍 Error uploading recipe:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to upload recipe',
    });
  }

  console.log(`✅ Recipe uploaded successfully: ${data?.id}, ${data?.title}`);
  return { status: 'ok', id: data?.id };
});
