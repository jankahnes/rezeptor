<template>
  <div>
    <div
      class="mx-auto max-w-screen-xl justify-center relative px-3 hidden md:block"
    >
      <NuxtImg
        :src="recipeStore.recipe?.picture ?? undefined"
        class="w-full md:h-100 object-cover rounded-xl"
      />
      <div
        class="max-w-screen-lg flex flex-col gap-4 bg-primary text-white p-8 rounded-xl mx-auto -mt-20 relative z-10 shadow-lg shadow-primary/20"
      >
        <div class="flex justify-between items-start gap-4">
          <h1 class="text-4xl font-bold">{{ recipeStore.recipe?.title }}</h1>
          <div class="flex gap-2 flex-wrap">
            <button
              class="button px-3 py-1 rounded-lg flex items-center !bg-transparent border border-white"
            >
              <span class="material-symbols-outlined">share</span>
            </button>
            <NuxtLink
              :to="{ path: '/recipe/new', query: { editCurrent: 'true' } }"
              class="button px-3 py-1 rounded-lg flex items-center !bg-transparent border border-white"
            >
              <span class="material-symbols-outlined">edit</span>
            </NuxtLink>
            <button
              class="button px-3 py-1 rounded-lg flex items-center !bg-transparent border border-white"
            >
              <span class="material-symbols-outlined">delete</span>
            </button>
            <button
              class="button px-3 py-1 rounded-lg flex items-center !bg-transparent border border-white"
            >
              <span class="material-symbols-outlined">print</span>
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
        <div class="flex items-center gap-1 flex-wrap">
          <FormsRatingField
            v-if="recipeStore.recipe?.rating"
            v-model="recipeStore.recipe.rating"
            :select="false"
            :star-width="20"
            :star-height="20"
            :spacing="-2"
            :id="250"
          ></FormsRatingField>
          <span class="text-sm font-semibold"
            >{{ recipeStore.recipe?.rating?.toFixed(1) }}
          </span>
          <span class="material-symbols-outlined ml-3 !text-2xl">timer</span>
          <span class="text-sm"
            >{{ capitalize(recipeStore.recipe?.effort) }} Effort</span
          >
          <span class="material-symbols-outlined ml-3 !text-2xl">bolt</span>
          <span class="text-sm"
            >{{ capitalize(recipeStore.recipe?.difficulty) }} Difficulty</span
          >
          <span class="material-symbols-outlined ml-3 !text-2xl"
            >attach_money</span
          >
          <span class="text-sm"
            >{{ formatMoney(recipeStore.recipe?.price) }} per serving</span
          >
        </div>
        <div class="">
          <span
            v-if="
              !showFullDescriptionDesktop &&
              recipeStore.recipe?.description &&
              recipeStore.recipe.description.length > desktopCharLimit
            "
          >
            {{ recipeStore.recipe.description.slice(0, desktopCharLimit) }}...
            <button
              @click="showFullDescriptionDesktop = true"
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
              @click="showFullDescriptionDesktop = false"
              class="text-secondary-400 hover:text-secondary-300 underline ml-1"
            >
              View Less
            </button>
          </span>
          <span v-else>
            {{ recipeStore.recipe?.description }}
          </span>
        </div>
        <div class="flex flex-wrap gap-2">
          <div
            class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border border-white"
            v-if="recipeStore.recipe?.tags"
            v-for="tag in recipeStore.recipe?.tags"
            :key="tag"
          >
            {{ getTagByID(tag)?.name }}
          </div>
        </div>
        <div class="flex flex-wrap gap-6 mt-4">
          <button
            @click="scrollIntoView(commentSection as HTMLElement)"
            class="text-sm"
          >
            Reviews ⌵
          </button>
          <button
            @click="scrollIntoView(nutritionSection as HTMLElement)"
            class="text-sm"
          >
            Nutrition ⌵
          </button>
          <NuxtLink :to="`/recipe/${id}/report`" class="text-sm"
            >Full Health Report →</NuxtLink
          >
        </div>
      </div>
      <div class="flex gap-10 mt-10 max-w-screen-lg mx-auto flex-wrap">
        <PagesRecipeIngredientList
          :ingredients="recipeStore.recipe?.ingredients"
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
        ></PagesRecipeCommentSection>
      </div>
    </div>

    <div class="md:hidden">
      <div
        class="w-full h-100 object-cover bg-cover bg-center bg-no-repeat p-4 relative z-0"
        :style="{ backgroundImage: `url(${recipeStore.recipe?.picture})` }"
      >
        <div
          class="absolute inset-0 bg-gradient-to-b from-main via-transparent to-transparent opacity-35 z-0 h-70"
        ></div>
        <div class="flex justify-between items-center z-10">
          <button
            @click="router.back()"
            class="button p-2 rounded-lg flex items-center shadow-lg"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
          <div class="flex items-center gap-2">
            <button class="button p-2 rounded-lg flex items-center shadow-lg">
              <span class="material-symbols-outlined">share</span>
            </button>
            <button class="button p-2 rounded-lg flex items-center shadow-lg">
              <span class="material-symbols-outlined">print</span>
            </button>
            <NuxtLink
              :to="{ path: '/recipe/new', query: { editCurrent: 'true' } }"
              class="button p-2 rounded-lg flex items-center shadow-lg"
            >
              <span class="material-symbols-outlined">edit</span>
            </NuxtLink>
            <button class="button p-2 rounded-lg flex items-center shadow-lg">
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>
      </div>

      <div
        ref="mobileOverlay"
        class="bg-white rounded-t-4xl z-10 relative transition-all duration-300 ease-out"
        :style="{ marginTop: `${overlayMarginTop}px` }"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
      >
        <div
          class="w-full h-14 flex items-center justify-center cursor-pointer"
        >
          <div class="h-[6px] mx-auto bg-gray-300 rounded-lg w-16"></div>
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
          <div class="text-sm text-gray-600 mt-4">
            <span
              v-if="
                !showFullDescriptionMobile &&
                recipeStore.recipe?.description &&
                recipeStore.recipe.description.length > mobileCharLimit
              "
            >
              {{ recipeStore.recipe.description.slice(0, mobileCharLimit) }}...
              <button
                @click="showFullDescriptionMobile = true"
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
                @click="showFullDescriptionMobile = false"
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
              v-if="recipeStore.recipe?.tags"
              v-for="tag in recipeStore.recipe?.tags"
              :key="tag"
            >
              {{ getTagByID(tag)?.name }}
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
            class="flex-1"
          ></NutritionLabel>
          <HealthFacts
            v-if="recipeStore.recipe"
            :recipe="recipeStore.recipe"
            class="flex-1 mt-8"
          ></HealthFacts>
          <PagesRecipeCommentSection :id="10"></PagesRecipeCommentSection>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const recipeStore = useRecipeStore();

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
const desktopCharLimit = 400;
const mobileCharLimit = 200;

// Touch overlay behavior
const overlayMarginTop = ref(-32); // -8 * 4 = -32px (Tailwind -mt-8)
const isDragging = ref(false);
const startY = ref(0);
const startMarginTop = ref(-32);
const minMarginTop = -300;
const maxMarginTop = -32;

const scrollIntoView = async (target: HTMLElement | undefined) => {
  if (!target) return;
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// Touch event handlers for overlay dragging
const onTouchStart = (e: TouchEvent) => {
  isDragging.value = true;
  startY.value = e.touches[0].clientY;
  startMarginTop.value = overlayMarginTop.value;

  // Disable transitions during drag
  if (mobileOverlay.value) {
    mobileOverlay.value.style.transition = 'none';
  }
};

const onTouchMove = (e: TouchEvent) => {
  if (!isDragging.value) return;

  const currentY = e.touches[0].clientY;
  const deltaY = currentY - startY.value;

  // Calculate new margin top, clamped to bounds
  const newMarginTop = Math.max(
    minMarginTop,
    Math.min(maxMarginTop, startMarginTop.value + deltaY)
  );

  overlayMarginTop.value = newMarginTop;

  // Prevent default scrolling when dragging within bounds
  if (newMarginTop > minMarginTop && newMarginTop < maxMarginTop) {
    e.preventDefault();
  }
};

const onTouchEnd = (e: TouchEvent) => {
  if (!isDragging.value) return;
  isDragging.value = false;

  // Re-enable transitions
  if (mobileOverlay.value) {
    mobileOverlay.value.style.transition = 'margin-top 0.3s ease-out';
  }

  // Snap to nearest position based on velocity and position
  const velocity = (e.changedTouches[0].clientY - startY.value) / 100; // Simple velocity calc
  const currentPosition = overlayMarginTop.value;
  const midPoint = (minMarginTop + maxMarginTop) / 2;

  if (Math.abs(velocity) > 2) {
    // Fast swipe - follow velocity direction
    overlayMarginTop.value = velocity > 0 ? maxMarginTop : minMarginTop;
  } else {
    // Slow drag - snap to nearest position
    overlayMarginTop.value =
      currentPosition < midPoint ? minMarginTop : maxMarginTop;
  }
};

if (id) {
  const { data } = await useRecipe({
    eq: { id },
  });
  recipeStore.setRecipe(data.value as RecipeProcessed);
}

useHead({
  title: recipeStore.recipe?.title + ' | Rezeptor',
});
</script>
