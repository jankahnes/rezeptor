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
        class="max-w-screen-lg flex flex-col gap-4 bg-primary text-white p-8 rounded-xl mx-auto -mt-20 relative z-10 shadow-md"
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
          <NuxtLink to="#comments" class="text-sm">Reviews ⌵</NuxtLink>
          <NuxtLink to="#nutrition" class="text-sm">Nutrition ⌵</NuxtLink>
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
          id="nutrition"
          v-if="recipeStore.recipe"
          :recipe="recipeStore.recipe"
          class="flex-1"
        ></NutritionLabel>
        <HealthFacts
          v-if="recipeStore.recipe"
          :recipe="recipeStore.recipe"
          class="flex-1"
        ></HealthFacts>
        <PagesRecipeCommentSection :id="0"></PagesRecipeCommentSection>
      </div>
    </div>

    <div class="md:hidden">
      <div
        class="w-full h-100 object-cover bg-cover bg-center bg-no-repeat p-4 relative z-0"
        :style="{ backgroundImage: `url(${recipeStore.recipe?.picture})` }"
      >
        <div
          class="absolute inset-0 bg-gradient-to-b from-main via-transparent to-transparent opacity-80 z-0 h-50"
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
        ref="draggableSection"
        class="bg-white rounded-t-4xl z-10 relative"
        :style="{ marginTop: `${dragOffset}px` }"
        @touchstart="handleContentTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
        @mousedown="handleContentMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
      >
        <div
          class="w-full h-14 flex items-center justify-center"
          ref="dragHandle"
          @touchstart.stop="handleHandleTouchStart"
          @mousedown.stop="handleHandleMouseDown"
        >
          <div
            class="h-[6px] mx-auto bg-gray-300 rounded-lg w-16 cursor-grab active:cursor-grabbing"
          ></div>
        </div>
        <div class="flex flex-col gap-1 px-6">
          <h1 class="text-3xl font-extrabold">
            {{ recipeStore.recipe?.title }}
          </h1>
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
                class="text-primary-600 hover:text-primary-500 underline ml-1"
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
                class="text-primary-600 hover:text-primary-500 underline ml-1"
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
              @click.capture="scrollSliderIntoView(scrollTarget as HTMLElement)"
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
const showFullDescriptionDesktop = ref(false);
const showFullDescriptionMobile = ref(false);
const desktopCharLimit = 400;
const mobileCharLimit = 200;

const draggableSection = ref<HTMLElement>();
const dragHandle = ref<HTMLElement>();
const dragOffset = ref(-20);
const isDragging = ref(false);
const isHandleDrag = ref(false);
const startY = ref(0);
const startOffset = ref(0);

const handleContentTouchStart = (e: TouchEvent) => {
  // Only start dragging if we're at the top of scrollable content AND at maxOffset
  const target = e.target as HTMLElement;
  const scrollableParent = findScrollableParent(target);

  // If there's scrollable content that can still scroll up, don't drag
  if (scrollableParent && scrollableParent.scrollTop > 0) {
    return;
  }

  // Only allow dragging up when we're at maxOffset (fully dragged down)
  if (dragOffset.value >= -20) {
    startDrag(e.touches[0].clientY);
  }
};

const handleContentMouseDown = (e: MouseEvent) => {
  // Only start dragging if we're at the top of scrollable content AND at maxOffset
  const target = e.target as HTMLElement;
  const scrollableParent = findScrollableParent(target);

  // If there's scrollable content that can still scroll up, don't drag
  if (scrollableParent && scrollableParent.scrollTop > 0) {
    return;
  }

  // Only allow dragging up when we're at maxOffset (fully dragged down)
  if (dragOffset.value >= -20) {
    startDrag(e.clientY);
  }
};

const findScrollableParent = (element: HTMLElement): HTMLElement | null => {
  let parent = element.parentElement;

  while (parent) {
    const overflow = window.getComputedStyle(parent).overflow;
    const overflowY = window.getComputedStyle(parent).overflowY;

    if (
      (overflow === 'auto' ||
        overflow === 'scroll' ||
        overflowY === 'auto' ||
        overflowY === 'scroll') &&
      parent.scrollHeight > parent.clientHeight
    ) {
      return parent;
    }

    parent = parent.parentElement;
  }

  return null;
};

const handleHandleTouchStart = (e: TouchEvent) => {
  isHandleDrag.value = true;
  startDrag(e.touches[0].clientY);
};

const handleHandleMouseDown = (e: MouseEvent) => {
  isHandleDrag.value = true;
  startDrag(e.clientY);
};

const startDrag = (clientY: number) => {
  isDragging.value = true;
  startY.value = clientY;
  startOffset.value = dragOffset.value;
  document.body.style.userSelect = 'none';
};

const handleTouchMove = (e: TouchEvent) => {
  if (isDragging.value) {
    const newY = e.touches[0].clientY;
    const deltaY = newY - startY.value;
    const potentialOffset = startOffset.value + deltaY;

    // If we're trying to drag further up than minOffset, stop dragging and allow page scroll
    if (potentialOffset < -300) {
      endDrag();
      return;
    }

    e.preventDefault();
    updateDragPosition(newY);
  }
};

const handleMouseMove = (e: MouseEvent) => {
  if (isDragging.value) {
    const newY = e.clientY;
    const deltaY = newY - startY.value;
    const potentialOffset = startOffset.value + deltaY;

    // If we're trying to drag further up than minOffset, stop dragging and allow page scroll
    if (potentialOffset < -300) {
      endDrag();
      return;
    }

    e.preventDefault();
    updateDragPosition(newY);
  }
};

const updateDragPosition = (clientY: number) => {
  const deltaY = clientY - startY.value;
  let newOffset = startOffset.value + deltaY;

  const minOffset = -300;
  const maxOffset = -20;

  newOffset = Math.max(minOffset, Math.min(maxOffset, newOffset));
  dragOffset.value = newOffset;
};

const handleTouchEnd = () => {
  endDrag();
};

const handleMouseUp = () => {
  endDrag();
};

const endDrag = () => {
  isDragging.value = false;
  isHandleDrag.value = false;
  document.body.style.userSelect = '';
};

const scrollSliderIntoView = async (target: HTMLElement) => {
  if (!target) return;
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
