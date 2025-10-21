<template>
  <div class="w-full px-4">
    <div class="flex flex-col gap-4 items-center mt-12 max-w-screen-lg mx-auto">
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
      <PagesNewRecipeLoadingScreen
        v-if="currentView === 'loading'"
        :job-id="job!.id"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore();
const supabase = useSupabaseClient<Database>();
const job = ref<{ id: number } | null>(null);
const route = useRoute();
const router = useRouter();

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

const createJob = async (type: string) => {
  const { data: jobData, error } = await (supabase as any)
    .from('jobs')
    .insert({
      updated_at: new Date().toISOString(),
      type: type,
    })
    .select()
    .single();
  if (error || !jobData) {
    throw createError({
      statusCode: 500,
      statusMessage:
        'Failed to create job: ' + (error?.message || 'No data returned'),
    });
  }
  job.value = jobData;
};

const submitFromNaturalLanguage = async (recipe: BaseRecipe) => {
  await createJob('natural-language');
  currentView.value = 'loading';
  recipe.user_id = auth.user?.id ?? null;
  recipe.batch_size = recipe.serves > 1 ? recipe.serves : null;
  const response = await $fetch('/api/create-recipe/from-base', {
    method: 'POST',
    body: {
      base_recipe_information: recipe,
      jobId: job.value?.id,
    },
  });
  afterResponse(response);
};

const submitFromPreparsed = async (recipe: ComputableRecipe) => {
  await createJob('uploadable');
  currentView.value = 'loading';
  recipe.user_id = auth.user?.id ?? null;
  recipe.batch_size = recipe.serves > 1 ? recipe.serves : null;
  const response = await $fetch('/api/create-recipe/from-uploadable', {
    method: 'POST',
    body: {
      ...recipe,
      jobId: job.value?.id,
    },
  });
  afterResponse(response);
};

const generateUrlVariations = (url: string) => {
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
  const urlVariations = generateUrlVariations(link);

  const recipes = await getRecipeOverviews(supabase, {
    in: { source: urlVariations },
  });
  if (recipes.length > 0) {
    const recipe = recipes[0];
    navigateTo(`/recipe/${recipe.id}`);
    return;
  }
  await createJob('link');
  currentView.value = 'loading';

  const response = (await $fetch('/api/create-recipe/from-link', {
    method: 'POST',
    body: {
      link: link,
      jobId: job.value?.id,
      args: {
        publish: false,
        source_type: 'WEBSITE',
        source: link,
        based_on: null,
        user_id: auth.user?.id ?? null,
        uploading_protocol: 'fast',
      },
    },
  })) as any;

  afterResponse(response);
};

const submitFromPicture = async (file: File) => {
  currentView.value = 'loading';
  await createJob('picture');

  const formData = new FormData();
  formData.append('image', file);
  formData.append('jobId', String(job.value?.id || ''));
  formData.append(
    'args',
    JSON.stringify({
      publish: false,
      source_type: 'PICTURE',
      source: null,
      based_on: null,
      user_id: auth.user?.id ?? null,
      uploading_protocol: 'fast',
    })
  );

  const response = (await $fetch('/api/create-recipe/from-picture', {
    method: 'POST',
    body: formData,
  })) as any;

  afterResponse(response);
};

const afterResponse = async (response: any) => {
  if (job.value?.id) {
    await (supabase as any).from('jobs').delete().eq('id', job.value.id);
  }

  if (response.status === 'ok') {
    navigateTo(`/recipe/${response.id}`);
  } else {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to import recipe: ' + response.status,
    });
  }
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

<style scoped></style>
