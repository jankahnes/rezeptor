<template>
  <NuxtLink
    v-if="recipe?.id"
    :to="'/recipe/' + recipe?.id"
    class="flex flex-col items-center group relative"
  >
    <NuxtImg
      v-if="recipe?.picture"
      class="w-full aspect-square object-contain relative z-10 shadow-gray-200 [filter:drop-shadow(0_0_8px_var(--tw-shadow-color))_drop-shadow(0_0_4px_var(--tw-shadow-color))] transition-all duration-300 group-hover:scale-[1.008]"
      :src="recipe?.picture"
    />
    <div
      v-else-if="recipe?.social_picture"
      class="relative w-full z-10 transition-all duration-300 group-hover:scale-[1.008]"
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
          />
        </div>
        <div
          class="pointer-events-none absolute inset-0 rounded-full white-fade-overlay z-20"
        ></div>
      </div>
      <div />
    </div>
    <div class="w-full relative -mt-10 z-0 h-full transition-all duration-300">
      <div
        class="bg-white px-6 pt-10 pb-[5%] w-full rounded-3xl min-h-40 h-full"
      >
        <div class="pt-4 flex flex-col gap-4 justify-between h-full">
          <h2
            class="font-semibold leading-6 text-xl sm:text-2xl tracking-tight line-clamp-2"
          >
            {{ recipe?.title }}
          </h2>
          <div
            class="flex gap-1.5 flex-wrap-reverse text-[0.6em] sm:text-[0.4em] max-h-[3.4rem] overflow-y-hidden items-start py-0.5"
          >
            <div
              v-if="recipe?.hidx && recipe?.hidx >= 55"
              class="flex tag items-center !text-black shadow-sm text-center min-w-[1.6em] subpixel-antialiased tabular-nums justify-center"
              :class="gradeColors[getGrade(recipe?.hidx, 'ovr')]"
            >
              {{ getGrade(recipe?.hidx, 'ovr') }}
            </div>
            <div
              class="tag flex items-center gap-1 shadow-sm"
              v-if="recipe?.rating && recipe?.rating >= 4"
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
              v-for="(tag, index) in top4Tags"
              :key="index"
            >
              {{ tag?.name }}
            </div>
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
const top4Tags = ref(getTop4Tags(props.recipe));

function getTop4Tags(recipe: RecipeOverview) {
  if (!recipe?.tags) return [];
  const tags = recipe.tags.map((tag) => getTagByID(tag));
  tags.sort((a, b) => (b?.value ?? 0) - (a?.value ?? 0));
  const cropped = tags.slice(0, 4);
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
