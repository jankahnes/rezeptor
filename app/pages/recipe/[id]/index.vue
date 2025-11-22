<template>
  <div class="mx-10">
    <div class="w-full p-30 text-center" v-if="recipeError">
      <p class="text-xl font-bold text-primary">Recipe not found</p>
    </div>
    <Transition name="fade" mode="out-in">
      <main v-if="recipeShow" class="mx-12 my-12 space-y-12">
        <div class="flex gap-12">
          <RecipeCardOverview
            :recipe="recipeStore.recipe!"
            :uniqueId="recipeStore.recipe?.id?.toString() ?? ''"
            class="flex-1"
          ></RecipeCardOverview>
        </div>
        <div class="flex gap-12 flex-wrap items-start">
          <div class="flex-1 flex gap-12 flex-wrap shrink">
            <PagesRecipeInstructionContainer
              v-if="recipeStore.recipe"
              :instructions="recipeStore.recipe?.instructions"
              :ingredients="recipeStore.recipe?.ingredients"
              :servingSize="servingSize"
              class="w-full"
              :hideHeader="false"
              :formalizationLoading="job?.step === 'formalizing_instructions'"
              :displayFormalize="displayInstructionsFormalize"
              :formalize="formalizeInstructions"
            ></PagesRecipeInstructionContainer>
            <NutritionLabel
              v-if="recipeStore.recipe"
              :nutritionData="recipeStore.recipe"
              class="basis-100"
            />
            <HealthFacts
              v-if="recipeStore.recipe"
              :recipe="recipeStore.recipe"
              class="basis-100"
            />
            <PagesRecipePublishChecklist
              :recipe="recipeStore.recipe!"
              :refresh="() => loadRecipeWithoutLoading(id, true)"
              class="flex-1 basis-100"
            ></PagesRecipePublishChecklist>
            <PagesRecipeCommentSection
              :id="0"
              class="flex-1 basis-100"
            ></PagesRecipeCommentSection>
          </div>
          <PagesRecipeIngredientList
            :addedInfo="{
              addedFat: recipeStore.recipe?.added_fat ?? 0,
              addedSalt: recipeStore.recipe?.added_salt ?? 0,
              batchSize: recipeStore.recipe?.batch_size ?? 1,
            }"
            :ingredients="recipeStore.recipe?.ingredients"
            :baseIngredients="recipeStore.recipe?.base_ingredients ?? []"
            :batchSize="recipeStore.recipe?.batch_size ?? undefined"
            :recipeId="recipeStore.recipe?.id"
            v-model:servingSize="servingSize"
            class="shrink-0 lg:basis-125 sticky top-10"
            :formalizationLoading="job?.step === 'formalizing_ingredients'"
            :displayFormalize="displayIngredientsFormalize"
            :formalize="formalizeIngredients"
          ></PagesRecipeIngredientList>
        </div>
      </main>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import convertUploadableToComputable from '~~/server/utils/convertUploadableToComputable';

const route = useRoute();
const router = useRouter();
const recipeStore = useRecipeStore();
const supabase = useSupabaseClient<Database>();
const auth = useAuthStore();
const { useAsyncDataWithLoading } = useGlobalLoading();

const id = Number(route.params.id);

const mobileChosen = ref('ingredients');
const mobileChoices = ref<{ value: string; displayName: string }[]>([
  { value: 'ingredients', displayName: 'INGREDIENTS' },
  { value: 'method', displayName: 'METHOD' },
]);

// Serving size state - managed at page level for both IngredientList and InstructionContainer
const servingSize = ref(2); // Default to 2 servings

const scrollTarget = ref();
const commentSection = ref();
const nutritionSection = ref();
const mobileOverlay = ref();

const showFullDescriptionDesktop = ref(false);
const showFullDescriptionMobile = ref(false);
const desktopCharLimit = 200;
const mobileCharLimit = 200;

const similarRecipes = ref<RecipeOverview[]>([]);
const isRecomputing = ref(false);

const jobId = ref(Number(route.query.poll as string) ?? null);

const disableFormalizeButtons = ref(false);

const displayIngredientsFormalize = computed(() => {
  return !!(
    !disableFormalizeButtons.value &&
    !job?.value?.step &&
    ((auth.user?.id === recipeStore.recipe?.user?.id &&
      !recipeStore.recipe?.ingredients?.length) ||
      auth.user?.username === 'administrator') &&
    recipeStore.recipe?.base_ingredients
  );
});

const displayInstructionsFormalize = computed(() => {
  const publishingRequirements = getPublishingRequirements(recipeStore.recipe);
  return !!(
    !disableFormalizeButtons.value &&
    !job?.value?.step &&
    !displayIngredientsFormalize.value &&
    auth.user?.id === recipeStore.recipe?.user?.id &&
    publishingRequirements.hasInstructions &&
    !publishingRequirements.instructionsMatchedToIngredients
  );
});

const formalizeIngredients = async () => {
  disableFormalizeButtons.value = true;
  const job = await createJob(
    supabase,
    'formalize_ingredients',
    'formalizing_ingredients'
  );
  jobId.value = job.id;
  onJobStepChange('formalizing_ingredients', null);
  $fetch('/api/create-recipe/postprocess-ingredients', {
    method: 'POST',
    body: {
      recipeId: id,
      jobId: jobId.value,
    },
  });
  start();
};

const formalizeInstructions = async () => {
  disableFormalizeButtons.value = true;
  const job = await createJob(
    supabase,
    'formalize_instructions',
    'formalizing_instructions'
  );
  jobId.value = job.id;
  onJobStepChange('formalizing_instructions', null);
  $fetch('/api/create-recipe/postprocess-instructions', {
    method: 'POST',
    body: {
      recipeId: id,
      jobId: jobId.value,
    },
  });
  start();
};

const { job, isPolling, error, start, stop, restart, fetchJob } = useJobPolling(
  jobId,
  supabase
);

const loadingStore = useLoadingStore();

const loadingMessages = {
  formalizing_ingredients: 'Analyzing ingredients ✨',
  formalizing_instructions: 'Analyzing instructions ✨',
  pre_publish: 'Finishing up 🎉',
  '': '',
  idle: '',
} as Record<string, string>;

function onJobStepChange(newStep: string | null, oldStep: string | null) {
  loadingStore.displayToast(loadingMessages[newStep ?? ''] ?? '');
  if (newStep === 'formalizing_ingredients' && job.value?.message) {
    loadingStore.displayToast(job.value?.message);
  }
  if (newStep !== oldStep && oldStep != null) {
    loadRecipeWithoutLoading(id, true);
    if (!newStep) {
      loadingStore.displayTransientToast('Done! 🎉');
      stop();
    }
  }
}

watch(
  () => job.value?.step,
  (newStep, oldStep) => {
    onJobStepChange(newStep, oldStep);
  }
);

watch(
  () => recipeStore.recipe?.picture,
  (newUrl) => {
    if (!newUrl) {
      return;
    }

    const img = new Image();
    img.src = newUrl;
  },
  { immediate: true }
);

const hasPicture = computed(() => {
  return !!(
    recipeStore.recipe?.picture || recipeStore.recipe?.source_type === 'MEDIA'
  );
});

const recipeShow = ref(false);
const recipeError = ref(false);

const loadRecipe = async (recipeId: number, force: boolean = false) => {
  if (recipeId && (force || recipeStore.recipe?.id !== recipeId)) {
    const { data, error } = await useAsyncData(
      'recipe-details-' + recipeId,
      () =>
        getRecipe(supabase, {
          eq: { id: recipeId },
        })
    );
    if (error.value || !data.value) {
      recipeError.value = true;
      return;
    }
    const recipe = data.value as Recipe;
    if (!recipe.picture && recipe.source_type === 'MEDIA') {
      recipe.social_picture = await recipeStore.getSocialPicture(
        recipe.source ?? '',
        true
      );
    }
    recipeStore.setRecipe(recipe);
    recipeShow.value = true;
  } else if (recipeStore.recipe?.id === recipeId) {
    recipeShow.value = true;
  }
  servingSize.value = recipeStore.recipe?.batch_size ?? 2;
};

const loadRecipeWithoutLoading = async (
  recipeId: number,
  force: boolean = false
) => {
  if (recipeId && (force || recipeStore.recipe?.id !== recipeId)) {
    const recipe = await getRecipe(supabase, {
      eq: { id: recipeId },
    });
    if (!recipe.picture && recipe.source_type === 'MEDIA') {
      recipe.social_picture = await recipeStore.getSocialPicture(
        recipe.source ?? '',
        false
      );
    }
    recipeStore.setRecipe(recipe as Recipe);
    servingSize.value = recipeStore.recipe?.batch_size ?? 2;
  }
};

loadRecipe(id, false);

watchEffect(() => {
  useHead({
    title: recipeStore.recipe?.title + ' | Rezeptor',
  });
});

const scrollIntoView = async (target: any, offset: number = 0) => {
  if (!target) return;

  // Handle Vue component refs by accessing $el
  let domElement: HTMLElement;
  if (target.$el) {
    domElement = target.$el;
  } else {
    domElement = target;
  }

  if (!domElement || !domElement.getBoundingClientRect) return;

  // Get the target's position
  const targetRect = domElement.getBoundingClientRect();
  const targetTop = targetRect.top + window.pageYOffset;

  // Scroll to the target position minus the offset
  window.scrollTo({
    top: targetTop - offset,
    behavior: 'smooth',
  });
};

onMounted(async () => {
  if (
    !recipeStore.recipe?.picture &&
    recipeStore.recipe?.source_type === 'MEDIA'
  ) {
    recipeStore.recipe.social_picture = await recipeStore.getSocialPicture(
      recipeStore.recipe.source ?? '',
      false
    );
  }
  start();
  const { track, trackTimeSpent } = useEngagement();
  track(id, 'click');
  trackTimeSpent(id);
  const recipes = await getRecipeOverviews(supabase, {
    //eq: { visibility: 'PUBLIC' },
    neq: { id },
    or: 'picture.not.eq.null,source_type.eq.MEDIA',
    trigram_search: { query: recipeStore.recipe?.title ?? '', column: 'title' },
    limit: 3,
  });
  similarRecipes.value = recipes as RecipeOverview[];
});

const deleteRecipe = async () => {
  await $fetch('/api/db/delete-recipe', {
    method: 'POST',
    body: {
      recipeId: id,
    },
  });
  recipeStore.deleteRecipe(id);
  recipeStore.setRecipe({} as Recipe);
  router.push('/');
};
</script>
