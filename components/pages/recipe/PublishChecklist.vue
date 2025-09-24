<template>
  <div class="disabled:opacity-20 disabled:cursor-not-allowed">
    <div class="flex flex-col gap-4 p-2 md:p-6 !pb-3 md:w-3xl">
      <div class="px-4 py-1 bg-primary text-white rounded-lg inline-flex w-fit">
        <h2 class="text-lg font-bold">PUBLISH</h2>
      </div>
      <div
        v-if="recipe.visibility === 'PUBLIC'"
        class="flex gap-2 items-center opacity-60"
      >
        <span class="material-symbols-outlined !text-2xl"> check </span>
        <span class="text-lg flex-1">Your recipe is public!</span>
      </div>
      <div class="flex flex-col gap-3" v-else>
        <div class="max-w-md">
          <p class="text-lg">Your recipe is unlisted.</p>
          <p class="text-xs text-gray-500">
            Your recipe is still visible to others through your profile, but not
            in search results and recommendations.
          </p>
        </div>
        <div
          class="flex gap-2 items-center flex-wrap gap-y-1 mt-4"
          :class="{
            'opacity-50': recipe.processing_requirements?.has_instructions,
          }"
        >
          <span class="material-symbols-outlined !text-2xl">
            {{
              recipe.processing_requirements?.has_instructions
                ? 'check'
                : 'arrow_forward'
            }}
          </span>
          <span class="text-[18px] flex-1 text-nowrap"
            >Add cooking instructions</span
          >
          <div class="flex gap-2 items-center flex-wrap">
            <button
              class="button px-2 py-1 flex gap-2 items-center text-primary outline-1 outline-primary"
              v-if="!recipe.processing_requirements?.has_instructions"
              @click="generateInstructions"
              :disabled="generateInstructionsLoading"
            >
              <span class="material-symbols-outlined">
                {{ generateInstructionsLoading ? 'timer' : 'auto_awesome' }}
              </span>
              <span>{{
                generateInstructionsLoading ? 'Generating...' : 'Generate'
              }}</span>
            </button>
            <button
              class="button px-2 py-[5px] flex gap-2 items-center !text-white !bg-primary"
              v-if="!recipe.processing_requirements?.has_instructions"
              @click="scrollToEditableInstructions"
              :disabled="generateInstructionsLoading"
            >
              <span class="material-symbols-outlined"> edit </span>
              <span>Add</span>
            </button>
          </div>
        </div>
        <div
          class="flex gap-2 items-center flex-wrap gap-y-1"
          :class="{ 'opacity-50': recipe.processing_requirements?.has_picture }"
        >
          <span class="material-symbols-outlined !text-2xl">
            {{
              recipe.processing_requirements?.has_picture
                ? 'check'
                : 'arrow_forward'
            }}
          </span>
          <span class="text-[18px] flex-1 text-nowrap mr-4">Add picture</span>
          <div class="flex gap-2 items-center flex-wrap">
            <button
              class="button px-2 py-1 flex gap-2 items-center text-primary outline-1 outline-primary"
              v-if="!recipe.processing_requirements?.has_picture"
              @click="generatePicture"
              :disabled="generatePictureLoading"
            >
              <span class="material-symbols-outlined">
                {{ generatePictureLoading ? 'timer' : 'auto_awesome' }}
              </span>
              <span>{{
                generatePictureLoading ? 'Generating...' : 'Generate'
              }}</span>
            </button>
            <button
              class="button px-2 py-1 flex gap-2 items-center text-primary outline-1 outline-primary"
              v-if="!recipe.processing_requirements?.has_picture"
              @click="triggerFileUpload"
              :disabled="generatePictureLoading"
            >
              <span class="material-symbols-outlined"> file_upload </span>
              <span>Upload</span>
            </button>

            <button
              class="button px-2 py-[5px] flex gap-2 items-center !text-white !bg-primary"
              v-if="!recipe.processing_requirements?.has_picture"
              @click="triggerPhotoEnv"
              :disabled="generatePictureLoading"
            >
              <span class="material-symbols-outlined"> image </span>
              <span>Take picture</span>
            </button>
          </div>
        </div>
        <div class="md:hidden border-t border-gray-200 mt-2"></div>
        <div class="flex gap-2 items-center flex-wrap-reverse mt-2 md:mt-4">
          <button
            @click="publishRecipeWithGenerate"
            class="button px-2 py-1 flex gap-2 items-center text-primary outline-1 outline-primary"
            v-if="
              !recipe.processing_requirements?.has_instructions ||
              !recipe.processing_requirements?.has_picture
            "
            :disabled="publishLoading"
          >
            <span class="material-symbols-outlined">
              {{ publishLoading ? 'timer' : 'keyboard_arrow_up' }}
            </span>
            <span>{{
              publishLoading ? 'Generating...' : 'Generate & Publish'
            }}</span>
          </button>
          <button
            v-else
            class="button px-2 py-[5px] flex gap-2 items-center !text-white !bg-primary"
            @click="publishRecipe"
            :disabled="publishLoading"
          >
            <span class="material-symbols-outlined">
              {{ publishLoading ? 'timer' : 'keyboard_double_arrow_up' }}
            </span>
            <span>{{ publishLoading ? 'Publishing...' : 'Publish' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  recipe: RecipeProcessed;
  refresh: (recipeId: number, force: boolean) => Promise<void>;
}>();

const supabase = useSupabaseClient();
const generatePictureLoading = ref(false);
const generateInstructionsLoading = ref(false);
const publishLoading = ref(false);

const generatePicture = async () => {
  generatePictureLoading.value = true;
  const payload = {
    title: props.recipe.title,
    instructions: props.recipe.instructions,
    processing_requirements: props.recipe.processing_requirements,
  };
  const response = await $fetch('/api/create-recipe/get-processed-image', {
    method: 'POST',
    body: payload,
  });
  if (!response.image_base64) {
    generatePictureLoading.value = false;
    throw new Error('Failed to generate picture');
  }
  props.recipe.generated_image_url = response.generated_image_url;
  const imageData = await $fetch('/api/db/upload-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      image: response.image_base64,
      bucket: 'recipe',
      id: props.recipe.id,
    },
  });
  props.recipe.processing_requirements.has_picture = true;
  props.recipe.picture = imageData.publicUrl;
  await supabase
    .from('recipes')
    .update({
      picture: imageData.publicUrl,
      generated_image_url: response.generated_image_url,
      processing_requirements: {
        ...props.recipe.processing_requirements,
        has_picture: true,
      },
    })
    .eq('id', props.recipe.id);
  generatePictureLoading.value = false;
};

const generateInstructions = async () => {
  generateInstructionsLoading.value = true;
  const payload = {
    title: props.recipe.title,
    instructions: props.recipe.instructions,
    processing_requirements: props.recipe.processing_requirements,
    ingredients: props.recipe.ingredients,
  };
  const response = await $fetch('/api/create-recipe/get-instructions', {
    method: 'POST',
    body: payload,
  });
  Object.assign(props.recipe, response);
  props.recipe.processing_requirements.has_instructions = true;
  props.recipe.processing_requirements.instructions_matched_to_ingredients =
    true;
  await supabase
    .from('recipes')
    .update({
      ...response,
      processing_requirements: {
        ...props.recipe.processing_requirements,
        has_instructions: true,
        instructions_matched_to_ingredients: true,
      },
    })
    .eq('id', props.recipe.id);
  generateInstructionsLoading.value = false;
};

const publishRecipe = async () => {
  publishLoading.value = true;
  const payload = {
    ...props.recipe,
    serves: 1,
    publish: true,
  };
  const response = await $fetch('/api/create-recipe/from-uploadable', {
    method: 'POST',
    body: payload,
  });
  publishLoading.value = false;
  if (response.status !== 'ok') {
    throw new Error('Failed to publish recipe');
  }
  props.refresh(props.recipe.id, true);
};

const publishRecipeWithGenerate = async () => {
  publishLoading.value = true;
  const payload = {
    base_recipe_information: {
      ...props.recipe,
      serves: 1,
      publish: true,
    },
  };
  const response = await $fetch('/api/create-recipe/from-base', {
    method: 'POST',
    body: payload,
  });
  publishLoading.value = false;
  if (response.status !== 'ok') {
    throw new Error('Failed to publish recipe');
  }
  props.refresh(response.id, true);
};

const scrollToEditableInstructions = () => {
  console.log('scrollToEditableInstructions');
};

const triggerFileUpload = () => {
  console.log('triggerFileUpload');
};

const triggerPhotoEnv = () => {
  console.log('triggerPhotoEnv');
};
</script>

<style scoped></style>
