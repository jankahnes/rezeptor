<template>
  <NuxtLink
    :to="'/recipe/' + recipe?.id"
    v-if="recipe?.id"
    class="flex flex-col items-center group relative justify-end"
  >
    <NuxtImg
      v-if="recipe?.picture"
      class="w-[85%] aspect-square will-change-transform object-contain relative z-10 shadow-gray-200 [filter:drop-shadow(0_0_8px_var(--tw-shadow-color))_drop-shadow(0_0_4px_var(--tw-shadow-color))] transition-transform duration-500 group-hover:translate-y-[-1px] group-hover:scale-[1.01]"
      :src="recipe?.picture"
      :alt="recipe?.title"
    />
    <div
      v-else-if="recipe?.social_picture"
      class="relative w-[85%] z-10 will-change-transform transition-transform duration-500 group-hover:translate-y-[-2px] group-hover:scale-[1.01]"
    >
      <div
        class="bg-white rounded-full overflow-hidden relative z-10 aspect-square shadow-gray-200 [filter:drop-shadow(0_0_6px_var(--tw-shadow-color))_drop-shadow(0_0_2px_var(--tw-shadow-color))]"
      >
        <div
          class="absolute inset-x-0 top-1/2 -translate-y-1/2 w-full aspect-9/16"
        >
          <NuxtImg
            class="w-full h-full object-cover relative z-10 white-fade-mask"
            :src="recipe?.social_picture"
            :alt="recipe?.title"
          />
        </div>
        <div
          class="pointer-events-none absolute inset-0 rounded-full white-fade-overlay z-20"
        ></div>
      </div>
      <div />
    </div>
    <!-- was originally pt-[60%] -->
    <div
      class="w-full relative pt-[60%] px-6 pb-[5%] z-0 will-change-transform transition-transform duration-300 group-hover:translate-y-[1px] bg-primary-10 rounded-4xl min-h-40 max-h-100"
      :class="{ '-mt-[60%] ': recipe.picture || recipe.source }"
    >
      <div class="pt-4 flex flex-col gap-4 justify-between h-full items-center">
        <h2
          class="font-semibold leading-7 text-xl sm:text-2xl tracking-tight line-clamp-2 text-center"
        >
          {{ recipe?.title }}
        </h2>
        <div
          class="flex gap-1.5 flex-wrap text-[0.6em] sm:text-[0.4em] max-h-[3.4rem] overflow-y-hidden items-end justify-center py-0.5"
        >
          <div
            v-if="recipe?.hidx && recipe?.hidx >= 55"
            class="flex tag items-center justify-center !text-black shadow-sm text-center min-w-[2em] subpixel-antialiased tabular-nums"
            :class="gradeColors[getGrade(recipe?.hidx, 'ovr')]"
          >
            {{ getGrade(recipe?.hidx, 'ovr') }}
          </div>
          <div
            class="tag flex items-center gap-1 shadow-sm bg-primary-50"
            v-if="recipe?.rating && recipe?.rating >= 4"
            :class="{ 'bg-primary-200!': recipe?.rating >= 4.5 }"
          >
            <FormsRatingField
              :model-value="recipe?.rating"
              :star-width="13"
              :star-height="13"
              :select="false"
              :uniqueId="'card-new-' + recipe?.id + id"
            />
            <span>{{ recipe?.rating.toFixed(1) }}</span>
          </div>

          <div
            class="tag flex items-center justify-center text-nowrap shadow-sm"
            v-for="(tag, index) in top3Tags"
            :key="index"
          >
            {{ tag?.name }}
          </div>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{
  recipe: RecipeOverview;
  id?: string;
}>();
const top3Tags = ref(getTop3Tags(props.recipe));

function getTop3Tags(recipe: RecipeOverview) {
  if (!recipe?.tags) return [];
  const tags = recipe.tags.map((tag) => getTagByID(tag));
  tags.sort((a, b) => (b?.value ?? 0) - (a?.value ?? 0));
  const cropped = tags.slice(0, 3);
  return cropped;
}

const recipeStore = useRecipeStore();

onMounted(async () => {
  if (!props.recipe.picture && props.recipe.source_type === 'MEDIA') {
    props.recipe.social_picture = await recipeStore.getSocialPicture(
      props.recipe.source ?? '',
      false
    );
  }
});
</script>

<style scoped>
.white-fade-overlay {
  background: radial-gradient(
    circle at center,
    rgba(255, 255, 255, 0) 62%,
    rgba(255, 255, 255, 1) 75%
  );
}
</style>
