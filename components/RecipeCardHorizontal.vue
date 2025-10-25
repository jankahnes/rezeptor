<template>
  <NuxtLink
    v-if="recipe.id"
    :to="'/recipe/' + recipe?.id"
    class="flex flex-row items-center transition-all duration-300 max-w-lg"
    :class="recipe?.picture ? '!max-w-[624px]' : ''"
  >
    <!-- circular -->
    <NuxtImg
      v-if="recipe?.picture"
      class="h-28 xs:h-34 object-cover bg-transparent shadow-gray-200 [filter:drop-shadow(0_0_8px_var(--tw-shadow-color))_drop-shadow(0_0_4px_var(--tw-shadow-color))] relative z-10"
      :src="recipe?.picture || ''"
    />

    <div
      v-else-if="recipe?.social_picture"
      class="relative w-28 xs:w-34 flex-shrink-0"
    >
      <div
        class="bg-white rounded-full overflow-hidden relative z-10 aspect-square shadow-gray-300 [filter:drop-shadow(0_0_10px_var(--tw-shadow-color))_drop-shadow(0_0_6px_var(--tw-shadow-color))]"
      >
        <div
          class="absolute inset-x-0 top-1/2 -translate-y-1/2 w-full aspect-9/16"
        >
          <NuxtImg
            class="w-full h-full object-cover relative z-10 transition-all duration-300 group-hover:translate-y-[-1px] white-fade-mask"
            :src="recipe?.social_picture"
          />
        </div>
        <div
          class="pointer-events-none absolute inset-0 rounded-full white-fade-overlay z-20"
        ></div>
      </div>
      <div />
    </div>

    <div class="z-0 flex-1">
      <div
        class="bg-white px-6 py-2 shadow-md rounded-xl min-h-28 xs:min-h-34 flex flex-col gap-3 justify-center flex-1 min-w-50 max-w-100"
        :class="
          recipe?.picture || recipe?.social_picture ? '-ml-16 !pl-20 !pr-6' : ''
        "
      >
        <div class="w-full flex gap-6 justify-between items-start">
          <h2
            class="font-semibold leading-6 text-xl sm:text-2xl tracking-tight line-clamp-2"
          >
            {{ recipe?.title }}
          </h2>
        </div>
        <div
          class="flex gap-1.5 flex-wrap text-[0.6em] md:text-[0.4em] max-h-[3.4rem] overflow-hidden items-start py-0.5"
        >
          <div
            v-if="recipe?.hidx && recipe?.hidx >= 55"
            class="flex tag items-center !text-black shadow-sm text-center min-w-[2em] subpixel-antialiased tabular-nums"
            :class="gradeColors[getGrade(recipe?.hidx, 'ovr')]"
          >
            {{ getGrade(recipe?.hidx, 'ovr') }}
          </div>
          <div
            v-if="recipe?.rating && recipe?.rating >= 4"
            class="tag flex items-center gap-1 shadow-sm"
          >
            <FormsRatingField
              :model-value="recipe?.rating"
              :star-width="13"
              :star-height="13"
              :select="false"
              :id="'card-new-horizontal-' + recipe?.id"
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
}>();
const top3Tags = ref(getTop3Tags(props.recipe));

function getTop3Tags(recipe: RecipeOverview) {
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

<style scoped></style>
