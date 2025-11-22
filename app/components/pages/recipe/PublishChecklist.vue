<template>
  <div
    class="action-card action-card-padding flex flex-col gap-4 !pb-3 items-start disabled:opacity-20 disabled:cursor-not-allowed"
  >
    <ComponentHeader title="PUBLISH" />
    <div v-if="recipe.visibility === 'PUBLIC'" class="space-y-2 opacity-60">
      <div class="flex gap-2 items-center">
        <span class="material-symbols-outlined !text-2xl"> check </span>
        <span class="text-lg flex-1">Your recipe is public!</span>
      </div>
      <div class="flex gap-2 items-center">
        <span class="material-symbols-outlined !text-2xl"> show_chart </span>
        <span class="text-lg">Relevancy</span>
        <div
          class="progress-ring ml-2"
          :style="{ '--progress': recipe.relevancy + '%' }"
        >
          <div class="inner text-xs font-light">
            {{ recipe.relevancy }}
          </div>
        </div>
      </div>
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
          'opacity-50': publishingRequirements.hasInstructions,
        }"
      >
        <span class="material-symbols-outlined !text-2xl">
          {{
            publishingRequirements.hasInstructions ? 'check' : 'arrow_forward'
          }}
        </span>
        <span class="text-[18px] flex-1 text-nowrap"
          >Add cooking instructions</span
        >
        <div class="flex gap-2 items-center flex-wrap">
          <button
            class="button px-2 py-1 flex gap-2 items-center text-primary outline-1 outline-primary"
            v-if="!publishingRequirements.hasInstructions"
            @click="generateInstructions"
            :disabled="generateInstructionsLoading || generatePictureLoading"
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
            v-if="!publishingRequirements.hasInstructions"
            @click="scrollToEditableInstructions"
            :disabled="generateInstructionsLoading || generatePictureLoading"
          >
            <span class="material-symbols-outlined"> edit </span>
            <span>Add</span>
          </button>
        </div>
      </div>
      <div
        class="flex gap-2 items-center flex-wrap gap-y-1"
        :class="{ 'opacity-50': publishingRequirements.hasPicture }"
      >
        <span class="material-symbols-outlined !text-2xl">
          {{ publishingRequirements.hasPicture ? 'check' : 'arrow_forward' }}
        </span>
        <span class="text-[18px] flex-1 text-nowrap mr-4">Add picture</span>
        <div class="flex gap-2 items-center flex-wrap">
          <button
            class="button px-2 py-1 flex gap-2 items-center text-primary outline-1 outline-primary"
            v-if="!publishingRequirements.hasPicture"
            @click="generatePicture"
            :disabled="generatePictureLoading || generateInstructionsLoading"
          >
            <span class="material-symbols-outlined"> auto_awesome </span>
            <span>Generate</span>
          </button>
          <button
            class="button px-2 py-1 flex gap-2 items-center text-primary outline-1 outline-primary"
            v-if="!publishingRequirements.hasPicture"
            @click="triggerFileUpload"
            :disabled="generatePictureLoading || generateInstructionsLoading"
          >
            <span class="material-symbols-outlined"> file_upload </span>
            <span>Upload</span>
          </button>

          <button
            class="button px-2 py-[5px] flex gap-2 items-center !text-white !bg-primary"
            v-if="!publishingRequirements.hasPicture"
            @click="triggerPhotoEnv"
            :disabled="generatePictureLoading || generateInstructionsLoading"
          >
            <span class="material-symbols-outlined"> image </span>
            <span>Take picture</span>
          </button>
        </div>
      </div>
      <div class="md:hidden border-t border-gray-200 mt-2"></div>
      <div class="flex gap-2 items-center flex-wrap-reverse mt-2 md:mt-4">
        <!--
          <button
            @click="publishRecipeWithGenerate"
            class="button px-2 py-1 flex gap-2 items-center text-primary outline-1 outline-primary"
            v-if="
              !publishingRequirements.hasInstructions ||
              !publishingRequirements.hasPicture
            "
            :disabled="
              publishLoading ||
              generateInstructionsLoading ||
              generatePictureLoading
            "
          >
            <span class="material-symbols-outlined"> keyboard_arrow_up </span>
            <span>{{
              publishLoading ? 'Generating...' : 'Generate & Publish'
            }}</span>
          </button>
          -->
        <button
          v-if="
            publishingRequirements.hasInstructions &&
            publishingRequirements.hasPicture &&
            publishingRequirements.instructionsMatchedToIngredients
          "
          class="button px-2 py-[5px] flex gap-2 items-center !text-white !bg-primary"
          @click="publishRecipe"
          :disabled="
            publishLoading ||
            generateInstructionsLoading ||
            generatePictureLoading
          "
        >
          <span class="material-symbols-outlined">
            {{ publishLoading ? 'timer' : 'keyboard_double_arrow_up' }}
          </span>
          <span>{{ publishLoading ? 'Publishing...' : 'Publish' }}</span>
        </button>
      </div>
    </div>
    <button
      v-if="auth.user?.username === 'administrator'"
      class="button px-2 py-[3px] inline-flex gap-2 items-center !text-gray-800 !bg-primary-10/70 self-start"
      @click="deboost"
    >
      <span class="material-symbols-outlined"> stat_minus_2 </span>
      <span>Deboost</span>
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  recipe: Recipe;
  refresh: (recipeId: number, force: boolean) => Promise<void>;
}>();

const supabase = useSupabaseClient<Database>();
const generatePictureLoading = ref(false);
const generateInstructionsLoading = ref(false);
const publishLoading = ref(false);
const replaceImageLoading = ref(false);
const auth = useAuthStore();
const fileInput = ref<HTMLInputElement | null>(null);
const loadingStore = useLoadingStore();
const publishingRequirements = computed(() =>
  getPublishingRequirements(props.recipe)
);

const generatePicture = async () => {
  if (publishingRequirements.value.hasPicture) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Picture already there',
    });
  }
  generatePictureLoading.value = true;
  loadingStore.displayToast('Generating picture ✨');

  const payload = {
    title: props.recipe.title,
    instructions: props.recipe.instructions,
  };
  const response = await $fetch('/api/create-recipe/get-processed-image', {
    method: 'POST',
    body: payload,
  });
  if (!response.image_base64) {
    generatePictureLoading.value = false;
    loadingStore.displayTransientToast('Failed to generate picture ❌');
    throw new Error('Failed to generate picture');
  }
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
  props.recipe.picture = imageData.publicUrl;
  await supabase
    .from('recipes')
    .update({
      picture: imageData.publicUrl,
    })
    .eq('id', props.recipe.id);
  generatePictureLoading.value = false;
  loadingStore.displayTransientToast('Picture generated successfully! ✨');
};

const generateInstructions = async () => {
  generateInstructionsLoading.value = true;
  loadingStore.displayToast('Generating instructions ✨');
  const payload = {
    title: props.recipe.title,
    instructions: props.recipe.instructions,
    ingredients: props.recipe.ingredients,
  };
  const response = (await $fetch('/api/create-recipe/get-instructions', {
    method: 'POST',
    body: payload,
  })) as { description?: string; instructions: string[] };
  Object.assign(props.recipe, response);
  await supabase.from('recipes').update(response).eq('id', props.recipe.id);
  generateInstructionsLoading.value = false;
  loadingStore.displayTransientToast('Instructions generated successfully! ✨');
};

const publishRecipe = async () => {
  publishLoading.value = true;
  loadingStore.displayToast('Publishing recipe ✨');
  //if all processing_requirements are true, just publish the recipe
  if (
    !Object.values(publishingRequirements.value).every(
      (requirement) => requirement === true
    )
  ) {
    publishLoading.value = false;
    loadingStore.displayTransientToast(
      'Recipe is not ready to be published ❌'
    );
    throw new Error(
      'Publishing requirements not met: ' +
        Object.values(publishingRequirements.value)
          .filter((requirement) => requirement === false)
          .join(', ')
    );
  }
  await supabase
    .from('recipes')
    .update({
      visibility: 'PUBLIC',
    })
    .eq('id', props.recipe.id);
  publishLoading.value = false;
  loadingStore.displayTransientToast('Recipe published successfully! ✨');
  props.refresh(props.recipe.id, true);
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

const replaceImage = () => {
  fileInput.value?.click();
};

const handleFileSelected = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const shouldUpsert = Boolean(props.recipe.picture);
  const file = target.files?.[0];
  if (!file) return;

  replaceImageLoading.value = true;
  try {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('bucket', 'recipe');
    formData.append('id', props.recipe.id.toString());
    formData.append('shouldUpsert', shouldUpsert ? 'true' : 'false');

    const imageData = await $fetch('/api/db/upload-image', {
      method: 'POST',
      body: formData,
    });

    props.recipe.picture = imageData.publicUrl;
    await supabase
      .from('recipes')
      .update({
        picture: imageData.publicUrl,
      })
      .eq('id', props.recipe.id);

    // Reset the file input so the same file can be selected again
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  } catch (error) {
    console.error('Failed to upload image:', error);
  } finally {
    replaceImageLoading.value = false;
  }
};

const deboost = async () => {
  await supabase
    .from('recipes')
    .update({
      relevancy: Math.round(props.recipe.relevancy * 0.6),
      daily_engagement_score: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    })
    .eq('id', props.recipe.id);
};
</script>

<style scoped>
.progress-ring {
  --progress: 0%;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: conic-gradient(
    var(--color-primary) var(--progress),
    #ffffff var(--progress)
  );
  display: flex;
  align-items: center;
  justify-content: center;
}

.inner {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
