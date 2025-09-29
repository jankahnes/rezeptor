<template>
  <NuxtLink
    v-if="recipe.id"
    :to="'/recipe/' + recipe?.id"
    class="flex flex-col items-center transition-all duration-300 hover:translate-y-[-2px] relative max-w-sm"
  >
    <NuxtImg
      v-if="recipe?.picture"
      class="w-full aspect-square object-contain [filter:drop-shadow(0_0_8px_var(--tw-shadow-color))_drop-shadow(0_0_4px_var(--tw-shadow-color))] relative z-10"
      :src="recipe?.picture || ''"
      :class="[getGradeShadow(recipe?.hidx || 0, 'hidx')]"
    />
    <div class="w-full relative -mt-10 z-0 h-full">
      <div
        class="bg-white px-6 pt-10 pb-[5%] w-full shadow-md rounded-xl min-h-40 h-full"
      >
        <div class="pt-4 flex flex-col gap-3">
          <h2
            class="font-semibold leading-6 text-xl sm:text-2xl tracking-tight line-clamp-2 min-h-12"
          >
            {{ recipe?.title }}
          </h2>
          <div class="flex items-start gap-4 justify-between h-[3.2rem]">
            <div
              class="flex gap-1.5 flex-wrap text-[0.6em] md:text-[0.4em] max-h-[3.2rem] overflow-y-hidden"
            >
              <div
                class="tag flex items-center gap-1"
                :class="
                  recipe?.rating && recipe?.rating >= 4.5
                    ? 'golden-gradient-muted'
                    : 'metallic-gradient-simple'
                "
                v-if="recipe?.rating && recipe?.rating >= 4"
              >
                <FormsRatingField
                  :model-value="recipe?.rating"
                  :star-width="13"
                  :star-height="13"
                  :select="false"
                  :id="'card-new-' + recipe?.id"
                />
                <span>{{ recipe?.rating.toFixed(1) }}</span>
              </div>

              <div
                class="tag flex items-center justify-center text-nowrap"
                :class="tag?.background"
                v-for="(tag, index) in top3Tags"
                :key="index"
              >
                {{ tag?.descriptor }}
              </div>
            </div>
            <GradeContainer
              v-if="recipe?.hidx && recipe?.hidx >= 55"
              :score="recipe?.hidx || 0"
              type="hidx"
              class="hidden sm:flex text-sm sm:text-lg flex-shrink-0 self-end mb-1"
            />
          </div>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{
  recipe: RecipeProcessed;
}>();

const getTop3Tags = (recipe: RecipeProcessed) => {
  const tags = recipe.tags.map((tag) => getTagByID(tag.tag_id));
  const tagsWithDescriptors = tags.map((tag) => {
    if (tag) {
      return { ...tag, ...getTagDescriptor(tag.id, recipe) };
    }
    return null;
  });
  tagsWithDescriptors.sort((a, b) => (b?.value ?? 0) - (a?.value ?? 0));
  const cropped = tagsWithDescriptors.slice(0, 3);
  return cropped;
};

const top3Tags = ref(getTop3Tags(props.recipe));
</script>

<style scoped></style>
