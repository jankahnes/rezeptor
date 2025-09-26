
import { serverSupabaseClient } from '#supabase/server';

//Uploads a recipe from BaseRecipeInformation object
export default defineEventHandler(async (event) => {
  const input = await readBody(event);
  const { base_recipe_information, jobId } = input;
  const supabase = await serverSupabaseClient(event);

  if(!base_recipe_information.processing_requirements) {
    base_recipe_information.processing_requirements = {
      has_picture: false,
      has_instructions: base_recipe_information.instructions?.length,
      instructions_matched_to_ingredients: false,
      full_nutri_processing: false,
    }
  } 
  
  if(!base_recipe_information.ingredients) {
  Object.assign(
    base_recipe_information,
    await $fetch('/api/gpt/formalize-ingredient-string', {
      method: 'POST',
      body: {
        ingredients_string: base_recipe_information.ingredients_string,
        recipe_context_string: base_recipe_information.title,
        jobId: jobId,
      },
    })
  );

  if (jobId) {
    await supabase
      .from('jobs')
      .update({
        step_index: 4,
        updated_at: new Date(),
        message: '',
      })
      .eq('id', jobId);
  }
}
  // Full Uploading Prototol
  if (
    (base_recipe_information.publish ||
    base_recipe_information.uploading_protocol === 'full') &&
      !base_recipe_information.processing_requirements
        ?.instructions_matched_to_ingredients
  ) {
    //Instruction Generation and matching. Endpoint either called here with "full", or manually by user in publish section
    const descAndInstructions = await $fetch(
      '/api/create-recipe/get-instructions',
      {
        method: 'POST',
        body: {
          ...base_recipe_information,
        },
      }
    );
    Object.assign(base_recipe_information, descAndInstructions);
    base_recipe_information.processing_requirements.has_instructions = true;
    base_recipe_information.processing_requirements.instructions_matched_to_ingredients =
      true;
  }
  // Image handling logic
  if (
    ((base_recipe_information.publish ||
    base_recipe_information.uploading_protocol === 'full') &&
    !base_recipe_information.processing_requirements?.has_picture)
    || base_recipe_information.original_image_base64
  ) {
    const response = await $fetch('/api/create-recipe/get-processed-image', {
      method: 'POST',
      body: {
        ...base_recipe_information,
      },
    });
    Object.assign(base_recipe_information, response);
  }

  return await $fetch('/api/create-recipe/from-uploadable', {
    method: 'POST',
    body: {
      ...base_recipe_information,
      jobId: jobId,
    },
  });
});
