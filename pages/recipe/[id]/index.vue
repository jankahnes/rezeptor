<template>
  <div>
    <div
      class="mx-auto max-w-screen-xl justify-center relative px-3 hidden md:block"
    >
      <div
        class="relative w-full rounded-xl overflow-hidden"
        :class="isProcessed ? 'h-150' : 'h-120'"
      >
        <NuxtImg
          :src="recipeStore.recipe?.picture ?? undefined"
          class="w-full h-full"
          :class="{
            'object-cover': !isProcessed,
            'object-contain': isProcessed,
          }"
        />
        <div
          v-if="!isProcessed"
          class="inset-x-0 bottom-0 h-[50%] bg-gradient-to-t from-black/80 via-black/40 to-transparent absolute z-0"
        ></div>
      </div>
      <div
        class="max-w-screen-lg flex flex-col gap-2 bg-primary text-white p-8 rounded-xl mx-auto relative z-10"
        :class="isProcessed ? '-mt-80' : '-mt-50'"
      >
        <div class="flex justify-between items-start gap-10">
          <h1 class="text-5xl font-bold tracking-tight">
            {{ recipeStore.recipe?.title }}
          </h1>
          <div class="flex gap-2 flex-nowrap items-center">
            <NuxtLink
              :to="{ path: '/recipe/new', query: { editCurrent: 'true' } }"
              class="button px-1 py-1 rounded-lg flex items-center !bg-transparent"
            >
              <span class="material-symbols-outlined !text-xl">edit</span>
            </NuxtLink>
            <button
              class="button px-1 py-1 rounded-lg flex items-center !bg-transparent"
            >
              <span class="material-symbols-outlined !text-xl">share</span>
            </button>
            <button
              class="button px-1 py-1 rounded-lg flex items-center !bg-transparent"
            >
              <span class="material-symbols-outlined !text-xl">print</span>
            </button>
            <button
              v-if="(auth?.user as any)?.username === 'administrator'"
              class="button px-1 py-1 rounded-lg flex items-center !bg-transparent"
              @click="recomputeRecipe"
              :disabled="isRecomputing"
            >
              <span class="material-symbols-outlined !text-xl">
                {{ isRecomputing ? 'hourglass_empty' : 'refresh' }}
              </span>
            </button>
            <button
              class="button px-1 py-1 rounded-lg flex items-center !bg-transparent"
              @click="deleteRecipe"
            >
              <span class="material-symbols-outlined !text-xl">delete</span>
            </button>
          </div>
        </div>
        <div class="flex items-center gap-2" v-if="recipeStore.recipe?.user">
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
            :id="250"
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
        <div class="grid grid-cols-[4fr_1fr] gap-20 items-end">
          <div
            class="flex flex-row-reverse flex-wrap-reverse gap-2 items-start justify-end"
          >
            <div
              class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-700/70 text-slate-100"
              v-if="(recipeStore.recipe as any)?.mappedTags"
              v-for="tag in (recipeStore.recipe as any)?.mappedTags"
              :key="tag.tag_id"
            >
              {{ tag.name }}
            </div>
          </div>
          <div class="flex flex-col gap-2 items-end justify-end">
            <button
              @click="scrollIntoView(commentSection as HTMLElement)"
              class="text-sm px-2 py-1 rounded-lg bg-slate-700/40 text-slate-100 flex items-center gap-1"
            >
              Reviews
              <span class="material-symbols-outlined !text-sm">
                keyboard_arrow_down
              </span>
            </button>
            <button
              @click="scrollIntoView(nutritionSection as HTMLElement)"
              class="text-sm px-2 py-1 rounded-lg bg-slate-700/40 text-slate-100 flex items-center gap-1"
            >
              Nutrition
              <span class="material-symbols-outlined !text-sm">
                keyboard_arrow_down
              </span>
            </button>
            <NuxtLink
              :to="`/recipe/${id}/report`"
              class="text-sm text-right px-2 py-1 rounded-lg bg-slate-700 text-slate-100 flex items-center gap-1"
            >
              Full Health Report
              <span class="material-symbols-outlined !text-sm">
                open_in_new
              </span>
            </NuxtLink>
          </div>
        </div>
      </div>
      <div class="flex gap-10 gap-y-6 mt-10 max-w-screen-lg mx-auto flex-wrap">
        <PagesRecipeIngredientList
          :ingredients="recipeStore.recipe?.ingredients"
          :batchSize="recipeStore.recipe?.batch_size ?? undefined"
          class="flex-1"
        ></PagesRecipeIngredientList>
        <PagesRecipeInstructionContainer
          v-if="recipeStore.recipe?.instructions"
          :instructions="recipeStore.recipe?.instructions ?? undefined"
          class="flex-1"
          :hideHeader="false"
        ></PagesRecipeInstructionContainer>
        <NutritionLabel
          ref="nutritionSection"
          v-if="recipeStore.recipe"
          :recipe="recipeStore.recipe"
          class="flex-1"
        ></NutritionLabel>
        <HealthFacts
          v-if="recipeStore.recipe"
          :recipe="recipeStore.recipe"
          class="flex-1"
        ></HealthFacts>
        <PagesRecipeCommentSection
          ref="commentSection"
          :id="0"
          class="flex-[1_1_60%]"
        ></PagesRecipeCommentSection>
        <div
          class="mt-6 p-2 md:p-6 flex-[1_0_40%] flex flex-col gap-2 items-start"
        >
          <div class="py-1 px-4 bg-primary text-white rounded-lg">
            <h2 class="text-lg font-bold">SIMILAR RECIPES</h2>
          </div>
          <div class="flex gap-2">
            <RecipeCard
              v-for="recipe in similarRecipes"
              :key="recipe.id"
              :recipe="recipe"
              class="w-50 h-80 text-[20px] sm:w-70 sm:h-100 sm:text-[28px] flex-shrink-0 hover:translate-y-[-2px] transition-all duration-300 mt-4"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="md:hidden">
      <div
        class="w-full h-100 bg-cover bg-center bg-no-repeat p-4 relative z-0"
        :class="{ '!bg-[length:90%] !bg-[position:center_60px]': isProcessed }"
        :style="{ backgroundImage: `url(${recipeStore.recipe?.picture})` }"
      >
        <div
          class="absolute inset-0 bg-gradient-to-b from-main via-transparent to-transparent opacity-35 z-0 h-70"
        ></div>
        <div class="flex justify-between items-center z-10">
          <button
            @click="router.back()"
            class="button p-2 rounded-lg flex items-center shadow-xl"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
          <div class="flex items-center gap-2">
            <button class="button p-2 rounded-lg flex items-center shadow-xl">
              <span class="material-symbols-outlined">share</span>
            </button>
            <button class="button p-2 rounded-lg flex items-center shadow-xl">
              <span class="material-symbols-outlined">print</span>
            </button>
            <NuxtLink
              :to="{ path: '/recipe/new', query: { editCurrent: 'true' } }"
              class="button p-2 rounded-lg flex items-center shadow-xl"
            >
              <span class="material-symbols-outlined">edit</span>
            </NuxtLink>
            <button
              v-if="(auth?.user as any)?.username === 'administrator'"
              class="button p-2 rounded-lg flex items-center shadow-xl"
              @click="recomputeRecipe"
              :disabled="isRecomputing"
            >
              <span class="material-symbols-outlined">
                {{ isRecomputing ? 'hourglass_empty' : 'refresh' }}
              </span>
            </button>
            <button
              class="button p-2 rounded-lg flex items-center shadow-xl"
              @click="deleteRecipe"
            >
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>
      </div>

      <div
        ref="mobileOverlay"
        class="bg-white rounded-t-4xl z-10 relative border-t-1 border-primary-100"
        :style="{ marginTop: `${overlayMarginTop}px` }"
        @touchstart="handleTouchStart"
      >
        <div
          class="w-full h-14 flex items-center justify-center cursor-pointer"
        >
          <div class="h-[6px] mx-auto bg-primary-100 rounded-lg w-16"></div>
        </div>
        <div class="flex flex-col gap-1 px-6">
          <div
            class="px-2 py-1 mt-4 border-3 border-primary rounded-lg self-start"
          >
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
                :id="'250-mobile'"
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
          <div class="flex flex-wrap gap-2 mt-4">
            <div
              class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium metallic-gradient-simple"
              v-if="(recipeStore.recipe as any)?.mappedTags"
              v-for="tag in (recipeStore.recipe as any)?.mappedTags"
              :key="tag.tag_id"
            >
              {{ tag.name }}
            </div>
          </div>
          <div ref="scrollTarget" class="mt-8 h-0"></div>
          <div class="sticky top-0 bg-white z-99 py-4">
            <FormsChoiceSlider
              v-model="mobileChosen"
              :choices="mobileChoices"
              :hideIcon="true"
              @click.capture="scrollIntoView(scrollTarget as HTMLElement)"
            />
          </div>
          <div>
            <PagesRecipeIngredientList
              :ingredients="recipeStore.recipe?.ingredients"
              class="flex-1"
              v-if="mobileChosen === 'INGREDIENTS'"
              :hideHeader="true"
              :batchSize="recipeStore.recipe?.batch_size ?? undefined"
            ></PagesRecipeIngredientList>
            <PagesRecipeInstructionContainer
              v-if="
                mobileChosen === 'METHOD' && recipeStore.recipe?.instructions
              "
              :instructions="recipeStore.recipe?.instructions ?? undefined"
              class="flex-1"
              :hideHeader="true"
            ></PagesRecipeInstructionContainer>
          </div>
          <NutritionLabel
            id="nutrition"
            v-if="recipeStore.recipe"
            :recipe="recipeStore.recipe"
            class="flex-1 mt-8"
          ></NutritionLabel>
          <HealthFacts
            v-if="recipeStore.recipe"
            :recipe="recipeStore.recipe"
            class="flex-1 mt-8"
          ></HealthFacts>
          <PagesRecipeCommentSection :id="10"></PagesRecipeCommentSection>
          <div class="mt-6 p-2 flex-[1_1_100%] flex flex-col gap-2 items-start">
            <div class="py-1 px-4 bg-primary text-white rounded-lg flex">
              <h2 class="text-lg font-bold">SIMILAR RECIPES</h2>
            </div>
            <div class="flex gap-2 flex-col mt-4">
              <RecipeCard
                v-for="(recipe, index) in similarRecipes"
                :key="recipe.id"
                :recipe="recipe"
                horizontal
                class="text-lg flex-shrink-0 hover:translate-y-[-2px] transition-all duration-300"
                :class="{ 'pl-4': index === 0 }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import RecipeCalculator from '~/utils/calculation/RecipeCalculator';
import stripKeys from '~/utils/format/stripKeys';
import { recipeKeys } from '~/types/keys';

const route = useRoute();
const router = useRouter();
const recipeStore = useRecipeStore();
const supabase = useSupabaseClient();
const auth = useAuthStore();

const id = Number(route.params.id);
const mobileChosen = ref('INGREDIENTS');
const mobileChoices = ref<[string, string][]>([
  ['INGREDIENTS', ''],
  ['METHOD', ''],
]);

const scrollTarget = ref<HTMLElement>();
const commentSection = ref<HTMLElement>();
const nutritionSection = ref<HTMLElement>();
const mobileOverlay = ref<HTMLElement>();

const showFullDescriptionDesktop = ref(false);
const showFullDescriptionMobile = ref(false);
const desktopCharLimit = 200;
const mobileCharLimit = 200;

const overlayMarginTop = ref(-150);
const minMarginTop = -300;
const maxMarginTop = -32;

const isProcessed = ref(false);
const similarRecipes = ref<RecipeProcessed[]>([]);
const isRecomputing = ref(false);

watch(
  () => recipeStore.recipe?.picture,
  (newUrl) => {
    if (!newUrl) {
      isProcessed.value = false;
      return;
    }

    const img = new Image();
    img.src = newUrl;

    img.onload = () => {
      isProcessed.value = img.naturalWidth === 500 && img.naturalHeight === 500;
    };

    img.onerror = () => {
      isProcessed.value = false;
    };
  },
  { immediate: true }
);

const loadRecipe = async (recipeId: number) => {
  if (recipeId) {
    const { data } = await useRecipe({
      eq: { id: recipeId },
    });
    const recipe = data.value as RecipeProcessed;
    (recipe as any).mappedTags = recipe.tags.map((tag: any) => getTagByID(tag));
    (recipe as any).mappedTags.sort((a: any, b: any) => a.value - b.value);

    recipeStore.setRecipe(recipe);
  }
};

await loadRecipe(id);

useHead({
  title: recipeStore.recipe?.title + ' | Rezeptor',
});

const scrollIntoView = async (target: HTMLElement | undefined) => {
  if (!target) return;
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

onMounted(async () => {
  if (mobileOverlay.value) {
    mobileOverlay.value.addEventListener('touchmove', handleTouchMove, {
      passive: false,
    });
  }
  const recipes = await getRecipesPartial(supabase, {
    eq: { visibility: 'PUBLIC' },
    neq: { id },
    not: { picture: null },
    orderBy: { column: 'created_at', ascending: false },
    limit: 3,
  });
  similarRecipes.value = recipes as RecipeProcessed[];
});

onUnmounted(() => {
  if (mobileOverlay.value) {
    mobileOverlay.value.removeEventListener('touchmove', handleTouchMove);
  }
});

let touchStartY = 0;
let lastTouchY = 0;

const handleTouchStart = (event: TouchEvent) => {
  touchStartY = event.touches[0].clientY;
  lastTouchY = touchStartY;
};

const handleTouchMove = (event: TouchEvent) => {
  if (!event.cancelable) {
    return;
  }
  const touch = event.touches[0];
  const deltaY = lastTouchY - touch.clientY;
  lastTouchY = touch.clientY;
  if (
    (overlayMarginTop.value <= minMarginTop && deltaY > 0) ||
    (overlayMarginTop.value >= maxMarginTop && deltaY < 0)
  ) {
    return;
  }
  event.preventDefault();

  const sensitivity = 1.5;
  const newMarginTop = Math.max(
    minMarginTop,
    Math.min(maxMarginTop, overlayMarginTop.value - deltaY * sensitivity)
  );
  overlayMarginTop.value = newMarginTop;
};

const deleteRecipe = async () => {
  if ((auth?.user as any)?.username !== 'administrator') {
    return;
  }
  await supabase.from('recipes').delete().eq('id', id);
  recipeStore.deleteRecipe(id);
  recipeStore.setRecipe({} as RecipeProcessed);
  router.push('/');
};

const recomputeRecipe = async () => {
  if ((auth?.user as any)?.username !== 'administrator') {
    return;
  }

  try {
    isRecomputing.value = true;

    // Convert recipe to editable format
    const editableRecipe = await recipeStore.convertToEditable();

    // Use RecipeCalculator to compute nutrition and health facts
    const calc = new RecipeCalculator(
      JSON.parse(JSON.stringify(editableRecipe)),
      false,
      false,
      false,
      false
    );
    await calc.computeRecipe();

    // Get the computed values, filtered by valid recipe keys
    const recomputedValues = stripKeys(calc.recipeComputed, recipeKeys);

    const { error: updateError } = await (supabase as any)
      .from('recipes')
      .update(recomputedValues)
      .eq('id', id);

    if (updateError) throw updateError;

    await loadRecipe(id);

    console.log('Recipe recomputed successfully');
  } catch (error) {
    console.error('Error recomputing recipe:', error);
  } finally {
    isRecomputing.value = false;
  }
};
</script>
