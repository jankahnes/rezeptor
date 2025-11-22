<template>
  <NuxtLink
    v-if="recipe?.id"
    :to="'/recipe/' + recipe?.id"
    class="transition-all duration-300 group ml-4 md:ml-0 md:min-h-90 max-w-5xl flex"
  >
    <div class="flex flex-row md:items-center w-full">
      <!-- circular -->
      <NuxtImg
        v-if="recipe?.picture"
        class="h-34 md:h-74 mt-6 md:mt-0 aspect-square object-cover bg-transparent shadow-[#00000044] [filter:drop-shadow(36px_45px_40px_var(--tw-shadow-color))_drop-shadow(0_0_10px_#00000015)] relative z-10 will-change-transform transition-transform duration-500 group-hover:translate-y-[-4px] group-hover:scale-[1.015]"
        :src="recipe?.picture || ''"
        fetchpriority="high"
        :alt="recipe?.title"
      />

      <div class="z-0 h-full flex-1">
        <div
          class="bg-primary-10 -ml-38 pl-44 md:-ml-64 md:pl-74 pr-4 md:pr-10 py-4 md:py-10 rounded-4xl h-full flex flex-col gap-2 md:gap-3 will-change-transform transition-transform duration-300 group-hover:translate-x-[2px]"
        >
          <h2
            class="font-bold text-3xl md:text-5xl tracking-tighter line-clamp-2 items-center gap-4 flex justify-between leading-none md:leading-14 max-w-2xl"
            :class="{ 'underline decoration-primary underline-offset-4': true }"
          >
            {{ recipe?.title }}
            <span
              class="bg-primary text-base font-bold px-3.5 py-1 rounded-full inline-flex items-center justify-center tracking-tight gap-1"
              v-if="false"
            >
              <span class="material-symbols-outlined text-xl! leading-none"
                >local_fire_department</span
              >
              <span class="">TRENDING</span>
            </span>
          </h2>
          <p class="text-xs md:text-base text-gray-600 leading-tight line-clamp-3 ml-1 max-w-2xl">
            {{ recipe?.description }}
          </p>
          <p class="flex items-center gap-2">
            <FormsRatingField
              :model-value="recipe?.rating"
              :star-width="24"
              :star-height="24"
              :spacing="2"
              :select="false"
              :uniqueId="`card-highlight-${recipe?.id}-${uniqueId}`"
              class="text-primary hidden md:inline-block"
            />
            <FormsRatingField
              :model-value="recipe?.rating"
              :star-width="18"
              :star-height="18"
              :select="false"
              :uniqueId="`card-highlight-mobile-${recipe?.id}-${uniqueId}`"
              class="text-primary inline-block md:hidden"
            />
            <span class="text-lg font-semibold leading-none mt-0.5">{{
              recipe?.rating.toFixed(1)
            }}</span>
          </p>
          <div class="flex flex-col flex-1 gap-2 justify-end items-start">
            <PagesRecipeSourceTypeTag
              class="hidden md:inline-flex !rounded-full text-sm flex-shrink-0 shadow px-2 py-1 bg-primary-20"
              :sourceType="recipe.source_type"
              :collection="recipe.collection ?? ''"
              :source="recipe.source ?? ''"
              :small="true"
            />
            <div
              class="flex gap-1.5 flex-wrap overflow-hidden py-0.5 text-xs md:text-sm"
            >
              <div
                v-if="recipe?.hidx && recipe?.hidx >= 55"
                class="flex tag items-center justify-center !text-black shadow-sm text-center min-w-[2em] subpixel-antialiased tabular-nums"
                :class="gradeColors[getGrade(recipe?.hidx, 'ovr')]"
              >
                {{ getGrade(recipe?.hidx, 'ovr') }}
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
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{
  recipe: RecipeOverview;
  uniqueId?: string;
}>();
const top3Tags = ref(getTop3Tags(props.recipe));

function getTop3Tags(recipe: RecipeOverview) {
  const tags = recipe.tags.map((tag) => getTagByID(tag));
  tags.sort((a, b) => (b?.value ?? 0) - (a?.value ?? 0));
  const cropped = tags.slice(0, 3);
  return cropped;
}
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
