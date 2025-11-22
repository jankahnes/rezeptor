<template>
  <div>
    <div class="w-full p-30 text-center" v-if="!recipeStore.recipe">
      <p class="text-xl font-bold text-primary">Recipe not found</p>
    </div>
    <div
      class="relative px-3 py-10 hidden md:block"
      v-if="recipeStore.recipe && show"
    >
      <div
        v-if="recipeStore.recipe.picture || job?.step === 'pre_publish'"
        class="relative mx-auto rounded-xl overflow-hidden h-150 aspect-square"
      >
        <NuxtImg
          v-if="recipeStore.recipe.picture"
          :src="recipeStore.recipe.picture"
          class="w-full h-full object-contain"
        />
        <Skeleton
          v-else
          class="h-full aspect-square object-contain rounded-full"
        />
      </div>
      <div
        v-else-if="recipeStore.recipe.social_picture"
        class="relative mx-auto h-150 aspect-9/16"
      >
        <NuxtImg
          :src="recipeStore.recipe.social_picture"
          class="h-full object-cover rounded-xl"
        />
      </div>
      <div
        class="mx-auto max-w-screen-lg flex flex-col gap-2 bg-primary-10 text-gray-800 p-8 rounded-3xl border border-gray-200 relative z-10"
        :class="
          hasPicture ||
          job?.step === 'pre_publish' ||
          recipeStore.recipe.social_picture
            ? '-mt-70'
            : 'mt-10'
        "
      >
        <div class="flex justify-between items-start gap-10">
          <h1 class="text-5xl font-bold tracking-tight">
            {{ recipeStore.recipe?.title }}
          </h1>
          <div class="flex gap-2 flex-nowrap items-center">
            <NuxtLink
              :to="{
                path: '/recipe/new',
                query: { editCurrent: 'true', view: 'form' },
              }"
              class="button px-1 py-1 rounded-lg flex items-center !bg-transparent outline-none"
            >
              <span class="material-symbols-outlined !text-xl">edit</span>
            </NuxtLink>
            <button
              class="button px-1 py-1 rounded-lg flex items-center !bg-transparent outline-none"
            >
              <span class="material-symbols-outlined !text-xl">share</span>
            </button>
            <button
              class="button px-1 py-1 rounded-lg flex items-center !bg-transparent outline-none"
            >
              <span class="material-symbols-outlined !text-xl">print</span>
            </button>
            <button
              v-if="(auth?.user as any)?.username === 'administrator'"
              class="button px-1 py-1 rounded-lg flex items-center !bg-transparent outline-none"
              @click="recomputeRecipe"
              :disabled="isRecomputing"
            >
              <span class="material-symbols-outlined !text-xl">
                {{ isRecomputing ? 'hourglass_empty' : 'refresh' }}
              </span>
            </button>
            <button
              v-if="(auth?.user as any)?.username === 'administrator'"
              class="button px-1 py-1 rounded-lg flex items-center !bg-transparent outline-none"
              @click="regeneratePicture"
              :disabled="regeneratePictureLoading"
            >
              <span class="material-symbols-outlined !text-xl">
                {{
                  regeneratePictureLoading ? 'hourglass_empty' : 'replace_image'
                }}
              </span>
            </button>
            <button
              class="button px-1 py-1 rounded-lg flex items-center !bg-transparent outline-none"
              @click="deleteRecipe"
            >
              <span class="material-symbols-outlined !text-xl">delete</span>
            </button>
          </div>
        </div>
        <div
          class="flex items-center gap-2"
          v-if="
            recipeStore.recipe?.user?.username &&
            ['PREPARSED', 'TEXT', 'PICTURE'].includes(
              recipeStore.recipe?.source_type
            )
          "
        >
          <Avatar :user="recipeStore.recipe?.user as any" class="w-8 h-8" />
          <span class="text-sm"
            >{{ recipeStore.recipe?.user?.username }} ·
            {{ timeAgo(recipeStore.recipe?.created_at) }}</span
          >
        </div>
        <div class="flex items-center gap-[2px] flex-wrap">
          <FormsRatingField
            v-if="recipeStore.recipe?.rating"
            v-model="recipeStore.recipe.rating"
            :select="false"
            :star-width="18"
            :star-height="18"
            :spacing="-2"
            :uniqueId="'250'"
          ></FormsRatingField>
          <span class="text-sm font-semibold"
            >{{ recipeStore.recipe?.rating?.toFixed(1) }}
          </span>
          <span class="mx-2 text-xl">·</span>
          <span class="material-symbols-outlined !text-xl">timer</span>
          <span class="text-sm"
            >{{ capitalize(recipeStore.recipe?.effort) }} Effort</span
          >
          <span class="mx-2 text-xl">·</span>
          <span class="material-symbols-outlined !text-xl">bolt</span>
          <span class="text-sm"
            >{{ capitalize(recipeStore.recipe?.difficulty) }} Difficulty</span
          >
          <span class="mx-2 text-xl">·</span>
          <span class="material-symbols-outlined !text-xl">attach_money</span>
          <span class="text-sm"
            >{{ formatMoney(recipeStore.recipe?.price) }} per serving</span
          >
        </div>
        <div
          class="text-sm leading-relaxed max-w-[80ch]"
          @click="showFullDescriptionDesktop = !showFullDescriptionDesktop"
        >
          <span
            v-if="
              !showFullDescriptionDesktop &&
              recipeStore.recipe?.description &&
              recipeStore.recipe.description.length > desktopCharLimit
            "
          >
            {{ recipeStore.recipe.description.slice(0, desktopCharLimit) }}...
            <button
              class="text-secondary-400 hover:text-secondary-300 underline ml-1"
            >
              View More
            </button>
          </span>
          <span
            v-else-if="
              showFullDescriptionDesktop &&
              recipeStore.recipe?.description &&
              recipeStore.recipe.description.length > desktopCharLimit
            "
          >
            {{ recipeStore.recipe.description }}
            <button
              class="text-secondary-400 hover:text-secondary-300 underline ml-1"
            >
              View Less
            </button>
          </span>
          <span v-else>
            {{ recipeStore.recipe?.description }}
          </span>
        </div>
        <div class="flex gap-10 w-full mt-2 items-end">
          <div class="flex-1 flex justify-between flex-col items-start">
            <div class="flex gap-2 flex-wrap my-2">
              <PagesRecipeSourceTypeTag
                class="inline-flex bg-gray-200 !rounded-full"
                :sourceType="recipeStore.recipe?.source_type"
                :collection="recipeStore.recipe?.collection ?? ''"
                :source="recipeStore.recipe?.source ?? ''"
              />
              <div
                class="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-200 gap-2"
                v-if="recipeStore.recipe?.original_creator_channel_name"
              >
                <span class="material-symbols-outlined !text-sm">favorite</span>
                Original Creator:
                {{ recipeStore.recipe?.original_creator_channel_name }}
              </div>
            </div>
            <div
              class="flex flex-row-reverse flex-wrap-reverse gap-2 items-start justify-end"
            >
              <div
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100"
                v-if="mappedTags"
                v-for="tag in mappedTags"
                :key="tag.id"
              >
                {{ tag.name }}
              </div>
            </div>
          </div>

          <div class="flex flex-shrink-0 flex-col gap-2 items-end justify-end">
            <button
              @click="scrollIntoView(commentSection, 100)"
              class="text-sm px-2 py-1 rounded-lg bg-gray-100 flex items-center gap-1"
            >
              Reviews
              <span class="material-symbols-outlined !text-sm">
                keyboard_arrow_down
              </span>
            </button>
            <button
              @click="scrollIntoView(nutritionSection, 100)"
              class="text-sm px-2 py-1 rounded-lg bg-gray-100 flex items-center gap-1"
            >
              Nutrition
              <span class="material-symbols-outlined !text-sm">
                keyboard_arrow_down
              </span>
            </button>
            <NuxtLink
              :to="`/recipe/${id}/report`"
              class="text-sm text-right px-2 py-1 rounded-lg bg-gray-200 flex items-center gap-1"
            >
              Health Insights
              <span class="material-symbols-outlined !text-sm">
                lightbulb
              </span>
            </NuxtLink>
          </div>
        </div>
      </div>
      <div class="flex gap-10 gap-y-6 mt-10 max-w-screen-lg mx-auto flex-wrap">
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
          class="flex-1"
          :formalizationLoading="job?.step === 'formalizing_ingredients'"
          :displayFormalize="displayIngredientsFormalize"
          :formalize="formalizeIngredients"
        ></PagesRecipeIngredientList>
        <PagesRecipeInstructionContainer
          v-if="recipeStore.recipe"
          :instructions="recipeStore.recipe?.instructions"
          :ingredients="recipeStore.recipe?.ingredients"
          :servingSize="servingSize"
          class="flex-1"
          :hideHeader="false"
          :formalizationLoading="job?.step === 'formalizing_instructions'"
          :displayFormalize="displayInstructionsFormalize"
          :formalize="formalizeInstructions"
        ></PagesRecipeInstructionContainer>
        <NutritionLabel
          ref="nutritionSection"
          v-if="recipeStore.recipe.kcal"
          :nutritionData="recipeStore.recipe"
          class="flex-1"
        ></NutritionLabel>
        <Skeleton
          v-else-if="job?.step === 'formalizing_ingredients'"
          class="h-90 rounded-2xl flex-[1_1_20rem]"
        />
        <HealthFacts
          v-if="recipeStore.recipe.hidx"
          :recipe="recipeStore.recipe"
          class="flex-1"
        ></HealthFacts>
        <Skeleton
          v-else-if="job?.step === 'formalizing_ingredients'"
          class="h-90 rounded-2xl flex-[1_1_20rem]"
        />
        <PagesRecipePublishChecklist
          v-if="
            recipeStore.recipe &&
            (auth.user?.username === 'administrator' ||
              auth.user?.id === recipeStore.recipe?.user?.id)
          "
          :recipe="recipeStore.recipe"
          :refresh="loadRecipeWithoutLoading"
          class="flex-1 flex-shrink-0 w-full"
        ></PagesRecipePublishChecklist>
        <PagesRecipeCommentSection
          ref="commentSection"
          :id="0"
          class="flex-[1_1_60%]"
        ></PagesRecipeCommentSection>
        <div
          class="mt-6 p-2 md:p-6 flex-[1_0_40%] flex flex-col gap-2 items-start"
        >
          <div class="py-1 px-4 bg-primary-20 rounded-lg">
            <h2 class="text-lg font-bold">SIMILAR RECIPES</h2>
          </div>
          <div class="flex gap-2 mt-6 -ml-4">
            <RecipeCard
              v-for="recipe in similarRecipes"
              :key="recipe.id"
              :recipe="recipe"
              class="w-60 min-h-80 text-[28px] flex-shrink-0 hover:translate-y-[-2px] transition-all duration-300"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="md:hidden" v-if="show && recipeStore.recipe">
      <div
        class="w-full h-100 bg-no-repeat p-4 relative z-0 bg-[length:105%] bg-[position:center_30px]"
        :class="{
          '!h-40':
            !hasPicture &&
            job?.step !== 'pre_publish' &&
            !recipeStore.recipe?.social_picture,
          'bg-cover !bg-[position:center]':
            !recipeStore.recipe.picture && recipeStore.recipe?.social_picture,
        }"
        :style="{
          backgroundImage: `url(${
            recipeStore.recipe?.picture || recipeStore.recipe?.social_picture
          })`,
        }"
      >
        <div
          class="absolute inset-0 bg-gradient-to-b from-main via-transparent to-transparent opacity-35 z-0 h-70"
        ></div>
        <div class="flex justify-between items-center z-10">
          <button
            @click="router.back()"
            class="button p-2 rounded-lg flex items-center"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
          <div class="flex items-center gap-2">
            <button class="button p-2 rounded-lg flex items-center">
              <span class="material-symbols-outlined">share</span>
            </button>
            <button class="button p-2 rounded-lg flex items-center">
              <span class="material-symbols-outlined">print</span>
            </button>
            <NuxtLink
              :to="{
                path: '/recipe/new',
                query: { editCurrent: 'true', view: 'form' },
              }"
              class="button p-2 rounded-lg flex items-center"
            >
              <span class="material-symbols-outlined">edit</span>
            </NuxtLink>
            <button
              v-if="(auth?.user as any)?.username === 'administrator'"
              class="button p-2 rounded-lg flex items-center"
              @click="recomputeRecipe"
              :disabled="isRecomputing"
            >
              <span class="material-symbols-outlined">
                {{ isRecomputing ? 'hourglass_empty' : 'refresh' }}
              </span>
            </button>
            <button
              class="button p-2 rounded-lg flex items-center"
              @click="deleteRecipe"
            >
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>
      </div>

      <div
        ref="mobileOverlay"
        class="bg-white rounded-t-4xl z-10 relative"
        :class="{
          'border-t-1 border-primary-100': hasPicture,
        }"
        :style="{ marginTop: `${overlayMarginTop}px` }"
      >
        <div
          class="w-full h-14 flex items-center justify-center cursor-pointer"
          v-if="hasPicture"
        >
          <div class="h-[6px] mx-auto bg-primary-100 rounded-lg w-16"></div>
        </div>
        <div class="flex flex-col gap-1 px-6">
          <div class="px-2 py-1 mt-4 self-start">
            <h1 class="text-3xl font-extrabold">
              {{ recipeStore.recipe?.title }}
            </h1>
          </div>
          <div class="mt-4">
            <div class="flex items-center gap-2">
              <FormsRatingField
                v-if="recipeStore.recipe?.rating"
                v-model="recipeStore.recipe.rating"
                :select="false"
                :star-width="20"
                :star-height="20"
                :spacing="-2"
                :uniqueId="'250-mobile'"
              ></FormsRatingField>
              <span class="text-sm font-semibold"
                >{{ recipeStore.recipe?.rating?.toFixed(1) }}
              </span>
            </div>
            <div class="flex items-center gap-6 mt-6 flex-wrap">
              <div class="flex flex-col items-start justify-center text-sm">
                <span class="font-semibold"
                  >{{ capitalize(recipeStore.recipe?.effort) }}
                </span>
                <span>Effort</span>
              </div>
              <div class="flex flex-col items-start justify-center">
                <span class="font-semibold"
                  >{{ capitalize(recipeStore.recipe?.difficulty) }}
                </span>
                <span>Difficulty</span>
              </div>
              <div class="flex flex-col items-start justify-center">
                <span class="font-semibold"
                  >{{ formatMoney(recipeStore.recipe?.price) }}
                </span>
                <span>per serving</span>
              </div>
            </div>
          </div>
          <div
            class="text-sm text-gray-600 mt-4"
            @click="showFullDescriptionMobile = !showFullDescriptionMobile"
          >
            <span
              v-if="
                !showFullDescriptionMobile &&
                recipeStore.recipe?.description &&
                recipeStore.recipe.description.length > mobileCharLimit
              "
            >
              {{ recipeStore.recipe.description.slice(0, mobileCharLimit) }}...
              <button
                class="text-primary/60 hover:text-primary/80 underline ml-1"
              >
                View More
              </button>
            </span>
            <span
              v-else-if="
                showFullDescriptionMobile &&
                recipeStore.recipe?.description &&
                recipeStore.recipe.description.length > mobileCharLimit
              "
            >
              {{ recipeStore.recipe.description }}
              <button
                class="text-primary/60 hover:text-primary/80 underline ml-1"
              >
                View Less
              </button>
            </span>
            <span v-else>
              {{ recipeStore.recipe?.description }}
            </span>
          </div>
          <div class="flex gap-2 flex-wrap my-2 items-center">
            <PagesRecipeSourceTypeTag
              class="inline-flex bg-primary-20 !rounded-full"
              :sourceType="recipeStore.recipe?.source_type"
              :collection="recipeStore.recipe?.collection ?? ''"
              :source="recipeStore.recipe?.source ?? ''"
            />
            <div
              class="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-20 gap-2"
              v-if="recipeStore.recipe?.original_creator_channel_name"
            >
              <span class="material-symbols-outlined !text-sm">favorite</span>
              Original Creator:
              {{ recipeStore.recipe?.original_creator_channel_name }}
            </div>
          </div>
          <div class="flex flex-wrap gap-2 mt-4">
            <div
              class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-20 opacity-90"
              v-if="mappedTags"
              v-for="tag in mappedTags"
              :key="tag.id"
            >
              {{ tag.name }}
            </div>
          </div>
          <NuxtLink
            :to="`/recipe/${id}/report`"
            class="text-sm text-right px-2 py-1 rounded-lg button !bg-primary-50 inline-flex self-start items-center gap-1 mt-4"
          >
            Health Insights
            <span class="material-symbols-outlined !text-sm"> lightbulb </span>
          </NuxtLink>
          <div ref="scrollTarget" class="mt-8 h-0"></div>
          <div class="sticky top-0 bg-white z-99 py-4">
            <FormsChoiceSlider
              v-model="mobileChosen"
              :choices="mobileChoices"
              @click.capture="scrollIntoView(scrollTarget)"
            />
          </div>
          <div>
            <PagesRecipeIngredientList
              :addedInfo="{
                addedFat: recipeStore.recipe?.added_fat ?? 0,
                addedSalt: recipeStore.recipe?.added_salt ?? 0,
                batchSize: recipeStore.recipe?.batch_size ?? 1,
              }"
              :ingredients="recipeStore.recipe?.ingredients"
              :baseIngredients="recipeStore.recipe?.base_ingredients ?? []"
              class="flex-1"
              v-if="mobileChosen === 'ingredients'"
              :hideHeader="true"
              :batchSize="recipeStore.recipe?.batch_size ?? undefined"
              :recipeId="recipeStore.recipe?.id"
              :formalizationLoading="job?.step === 'formalizing_ingredients'"
              v-model:servingSize="servingSize"
              :displayFormalize="displayIngredientsFormalize"
              :formalize="formalizeIngredients"
            ></PagesRecipeIngredientList>
            <PagesRecipeInstructionContainer
              v-if="
                mobileChosen === 'method' && recipeStore.recipe?.instructions
              "
              :instructions="recipeStore.recipe?.instructions ?? undefined"
              :ingredients="recipeStore.recipe?.ingredients"
              :servingSize="servingSize"
              class="flex-1"
              :hideHeader="true"
              :formalizationLoading="job?.step === 'formalizing_instructions'"
              :displayFormalize="displayInstructionsFormalize"
              :formalize="formalizeInstructions"
            ></PagesRecipeInstructionContainer>
          </div>
          <NutritionLabel
            id="nutrition"
            v-if="recipeStore.recipe.kcal"
            :nutritionData="recipeStore.recipe"
            class="flex-1 mt-8"
          ></NutritionLabel>
          <Skeleton
            v-else-if="job?.step === 'formalizing_ingredients'"
            class="w-105 h-91 flex-1 rounded-xl"
          />
          <HealthFacts
            v-if="recipeStore.recipe.hidx"
            :recipe="recipeStore.recipe"
            class="flex-1 mt-8"
          ></HealthFacts>
          <Skeleton
            v-else-if="job?.step === 'formalizing_ingredients'"
            class="w-105 h-91 flex-1 rounded-xl"
          />
          <PagesRecipePublishChecklist
            v-if="
              recipeStore.recipe &&
              (auth.user?.username === 'administrator' ||
                auth.user?.id === recipeStore.recipe?.user?.id)
            "
            :recipe="recipeStore.recipe"
            :refresh="loadRecipeWithoutLoading"
            class="flex-1 flex-shrink-0 w-full"
          ></PagesRecipePublishChecklist>
          <PagesRecipeCommentSection :id="10"></PagesRecipeCommentSection>
          <div class="mt-6 p-2 flex-[1_1_100%] flex flex-col gap-2 items-start">
            <div class="py-1 px-4 bg-primary-20 rounded-lg flex">
              <h2 class="text-lg font-bold">SIMILAR RECIPES</h2>
            </div>
            <div class="flex gap-2 flex-col mt-4">
              <RecipeCardHorizontal
                v-for="(recipe, index) in similarRecipes"
                :key="recipe.id"
                :recipe="recipe"
                class="text-lg flex-shrink-0 transition-all duration-300"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
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
const mappedTags = computed(() => {
  if (!recipeStore.recipe?.tags) return [];
  return (
    (recipeStore.recipe?.tags
      .map((tag: number) => getTagByID(tag))
      .filter((tag) => tag !== undefined)
      .slice(0, 6) as Tag[]) ?? []
  );
});
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

const overlayMarginTop = computed(() => {
  return hasPicture.value ? -100 : -75;
});

const show = ref(false);

const loadRecipe = async (recipeId: number, force: boolean = false) => {
  if (recipeId && (force || recipeStore.recipe?.id !== recipeId)) {
    //recipeStore.setRecipe({} as Recipe);
    const { data } = await useAsyncDataWithLoading('recipe-' + recipeId, () =>
      getRecipe(supabase, {
        eq: { id: recipeId },
      })
    );
    const recipe = data.value as Recipe;
    if (!recipe.picture && recipe.source_type === 'MEDIA') {
      recipe.social_picture = await recipeStore.getSocialPicture(
        recipe.source ?? '',
        true
      );
    }
    recipeStore.setRecipe(recipe);
    show.value = true;
  } else if (recipeStore.recipe?.id === recipeId) {
    show.value = true;
  }
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
  }
};

await loadRecipe(id, false);

if (recipeStore.recipe?.batch_size) {
  servingSize.value = recipeStore.recipe?.batch_size;
}

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
  useHead({
    title: recipeStore.recipe?.title + ' | Rezeptor',
  });
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

const recomputeRecipe = async () => {
  if ((auth?.user as any)?.username !== 'administrator') {
    return;
  }

  try {
    isRecomputing.value = true;
    if (!recipeStore.recipe) {
      return;
    }
    const editableRecipe = await convertUploadableToComputable(
      recipeStore.recipe,
      supabase,
      false
    );

    const nutritionEngineArgs = {
      recipe: JSON.parse(JSON.stringify(editableRecipe)),
      useGpt: false,
      logToReport: false,
      considerProcessing: false,
      temp_sidx: recipeStore.recipe?.sidx ?? 0,
    };
    const response = await $fetch('/api/calculate/recipe', {
      method: 'POST',
      body: {
        nutritionEngineArgs: nutritionEngineArgs,
      },
    });

    // Get the computed values, filtered by valid recipe keys
    const { error: updateError } = await (supabase as any)
      .from('recipes')
      .update(response.recipeRow)
      .eq('id', id);

    if (updateError) throw updateError;

    await loadRecipe(id, true);

    console.log('Recipe recomputed successfully');
  } catch (error) {
    console.error('Error recomputing recipe:', error);
  } finally {
    isRecomputing.value = false;
  }
};

const regeneratePictureLoading = ref(false);
const regeneratePicture = async () => {
  regeneratePictureLoading.value = true;
  const payload = {
    title: recipeStore.recipe?.title,
    instructions: recipeStore.recipe?.instructions,
  };
  const response = await $fetch('/api/create-recipe/get-processed-image', {
    method: 'POST',
    body: payload,
  });
  if (!response.image_base64) {
    regeneratePictureLoading.value = false;
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
      id: recipeStore.recipe?.id,
      shouldUpsert: recipeStore.recipe?.picture ? true : false,
    },
  });
  recipeStore.recipe!.picture = imageData.publicUrl;
  await supabase
    .from('recipes')
    .update({
      picture: imageData.publicUrl,
    })
    .eq('id', recipeStore.recipe!.id);
  regeneratePictureLoading.value = false;
};
</script>
