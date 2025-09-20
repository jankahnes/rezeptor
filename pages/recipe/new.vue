<template>
  <div class="flex flex-col gap-4 items-center mt-12 max-w-screen-md mx-auto">
    <FormsChoiceSlider
      v-if="currentView !== 'loading'"
      v-model="currentView"
      :choices="views"
      buttonStyle="py-1 text-sm font-bold"
    />
    <PagesNewRecipeForm
      v-if="currentView === 'form'"
      :submit="submitFromForm"
    />
    <PagesNewRecipeImport
      v-if="currentView === 'import'"
      :submit="submitFromLink"
    />
    <PagesNewRecipeLoadingScreen
      v-if="currentView === 'loading'"
      :job-id="job?.id"
    />
  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore();
const supabase = useSupabaseClient();
const job = ref(null);
const route = useRoute();
const router = useRouter();

const views: { value: string; displayName: string }[] = [
  {
    value: 'form',
    displayName: 'Create',
  },
  {
    value: 'import',
    displayName: 'Import',
  },
  {
    value: 'text',
    displayName: 'Describe',
  },
  {
    value: 'picture',
    displayName: 'Scan',
  },
];
const currentView = ref('');

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

const submitFromForm = async (recipe: RecipeProcessed) => {
  await createJob('uploadable');
  currentView.value = 'loading';
  const uploadableRecipe: UploadableRecipeInformation = {
    ...recipe,
    uploading_protocol: 'fast',
    source_type: 'preparsed',
    user_id: auth.user?.id ?? null,
    publish: false,
  };
  const response = await $fetch('/api/create-recipe/from-uploadable', {
    method: 'POST',
    body: {
      ...uploadableRecipe,
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

  const { data: recipe } = await supabase
    .from('recipes')
    .select('id')
    .in('source', urlVariations)
    .single();
  if (recipe) {
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
        source_type: 'website',
        source: link,
        based_on: null,
        user_id: auth.user?.id ?? null,
        uploading_protocol: 'fast',
      },
    },
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
      await auth.fetchUser();
      router.replace({ query: {} });
      submitFromLink(validUrl.href);
    }
  } else {
    currentView.value = 'form';
  }
});
</script>

<style scoped></style>
