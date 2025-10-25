<template>
  <div class="w-full px-4">
    <div class="flex flex-col gap-4 items-center mt-12 max-w-[900px] mx-auto">
      <FormsChoiceSlider
        v-if="currentView !== 'loading'"
        v-model="currentView"
        :choices="views"
        buttonStyle="py-1 text-sm font-bold"
        class=""
      />
      <PagesNewRecipeForm
        v-if="currentView === 'form'"
        :submitFromPreparsed="submitFromPreparsed"
        :submitFromNaturalLanguage="submitFromNaturalLanguage"
        class="w-full"
      />
      <PagesNewRecipeImport
        v-if="currentView === 'import'"
        :submit="submitFromLink"
      />
      <PagesNewRecipePicture
        v-if="currentView === 'picture'"
        :submit="submitFromPicture"
      />
      <div
        v-if="
          auth.user?.username === 'administrator' && currentView !== 'loading'
        "
        class="flex gap-6"
      >
        <input type="checkbox" id="publish" v-model="publish" />
        <label for="publish">Publish</label>
      </div>
      <div
        v-if="currentView === 'loading'"
        class="flex flex-col items-center mt-[20vh] gap-6"
      >
        <img src="/loading.png" class="h-8 w-8" />
        <Transition name="fade-up">
          <p class="italic" v-if="loadingMessage">
            {{ loadingMessage }}
          </p>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore();
const supabase = useSupabaseClient<Database>();
const job = ref<{ id: number } | null>(null);
const route = useRoute();
const router = useRouter();
const publish = ref(false);

const views: { value: string; displayName: string; icon?: string }[] = [
  {
    value: 'form',
    displayName: 'Create',
    icon: 'edit',
  },
  {
    value: 'import',
    displayName: 'Import',
    icon: 'download',
  },
  {
    value: 'picture',
    displayName: 'Scan',
    icon: 'visibility',
  },
];
const currentView = ref((route.query.view as string) || '');
const loadingMessage = ref('');



const submitFromNaturalLanguage = async (recipe: BaseRecipe) => {
  currentView.value = 'loading';
  job.value = await createJob(supabase, 'natural-language', 'formalizing_ingredients');
  setTimeout(() => {
    loadingMessage.value = '🔍 Gathering ingredients...';
  }, 5000);
  submitBaseRecipe(recipe);
};

const submitFromPreparsed = async (recipe: ComputableRecipe) => {
  currentView.value = 'loading';
  recipe.batch_size = recipe.serves > 1 ? recipe.serves : null;
  const response = await $fetch('/api/create-recipe/upload-processed-recipe', {
    method: 'POST',
    body: {
      ...recipe,
      full: false,
    },
  });
  if (response.status !== 'ok') {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create recipe',
    });
  }
  if (getPublishingRequirements(recipe).hasInstructions) {
  job.value = await createJob(supabase, 'preparsed', 'formalizing_instructions');
    $fetch('/api/create-recipe/postprocess-instructions', {
      method: 'POST',
      body: {
        recipeId: response.id,
        jobId: job.value?.id,
        publish: publish.value,
      },
    });
    navigateTo(`/recipe/${response.id}?poll=${job.value?.id}`);
  }
  else {
    navigateTo(`/recipe/${response.id}`);
  }
};

const generateUrlVariations = (url: string | null | undefined) => {
  if(!url) return [];
  try {
    const parsedUrl = new URL(url);
    const baseUrl = `${parsedUrl.hostname}${parsedUrl.pathname}${parsedUrl.search}`;

    return [url, `https://${baseUrl}`, `http://${baseUrl}`, baseUrl].filter(
      (variation, index, arr) => arr.indexOf(variation) === index
    );
  } catch {
    return [url];
  }
};

const submitFromLink = async (link: string) => {
  currentView.value = 'loading';
  const urlVariations = [...new Set([...generateUrlVariations(link), ...generateUrlVariations(cleanUrl(link))])];

  const recipes = await getRecipeOverviews(supabase, {
    in: { source: urlVariations },
  });
  if (recipes.length > 0) {
    const recipe = recipes[0];
    navigateTo(`/recipe/${recipe.id}`);
    return;
  }

  const supportedVideoSites = ['youtube', 'youtu.be', 'tiktok', 'instagram'];
  if (supportedVideoSites.some((site) => link.includes(site))) {
    job.value = await createJob(supabase, 'media', 'formalizing_ingredients');
    setTimeout(() => {
      loadingMessage.value = '🔍 Analyzing your video...';
    }, 5000);
    const baseRecipe = (await $fetch('/api/create-recipe/base-from-video', {
      method: 'POST',
      body: {
        url: link,
        args: {
          source_type: 'MEDIA',
          source: link,
        },
      },
    })) as BaseRecipe;
    submitBaseRecipe(baseRecipe);
  } else {
    job.value = await createJob(supabase, 'link', 'formalizing_ingredients');
    setTimeout(() => {
      loadingMessage.value = '🔍 Analyzing website...';
    }, 5000);
    const baseRecipe = (await $fetch('/api/create-recipe/base-from-link', {
      method: 'POST',
      body: {
        link: link,
        args: {
          source_type: 'WEBSITE',
          source: link,
        },
      },
    })) as BaseRecipe;
    submitBaseRecipe(baseRecipe);
  }
};

const submitFromPicture = async (file: File) => {
  currentView.value = 'loading';
  job.value = await createJob(supabase, 'picture', 'formalizing_ingredients');
  setTimeout(() => {
    loadingMessage.value = '🔍 Analyzing your picture...';
  }, 5000);
  const formData = new FormData();
  formData.append('image', file);
  formData.append(
    'args',
    JSON.stringify({
      source_type: 'PICTURE',
      source: null,
    })
  );

  const baseRecipe = (await $fetch('/api/create-recipe/base-from-picture', {
    method: 'POST',
    body: formData,
  })) as BaseRecipe;

  submitBaseRecipe(baseRecipe);
};

const submitBaseRecipe = async (baseRecipe: BaseRecipe) => {
  baseRecipe.user_id = auth.user?.id ?? null;
  baseRecipe.batch_size = baseRecipe.serves > 1 ? baseRecipe.serves : null;
  const { id } = await $fetch('/api/create-recipe/upload-base-recipe', {
    method: 'POST',
    body: {
      baseRecipe: baseRecipe,
    },
  });
  if (!id) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to upload recipe',
    });
  }
  $fetch('/api/create-recipe/postprocess-base-recipe', {
    method: 'POST',
    body: {
      recipeId: id,
      jobId: job.value?.id,
      publish: publish.value,
    },
  });
  navigateTo(`/recipe/${id}?poll=${job.value?.id}`);
};

onMounted(async () => {
  if (route.query.link) {
    const validUrl = new URL(route.query.link as string);
    if (validUrl.protocol === 'http:' || validUrl.protocol === 'https:') {
      router.replace({ query: { view: 'loading' } });
      await auth.fetchUser();
      submitFromLink(validUrl.href);
    }
  }
});
</script>

<style scoped>
.fade-up-enter-active,
.fade-up-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease-out;
}
.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
.fade-up-enter-to,
.fade-up-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
