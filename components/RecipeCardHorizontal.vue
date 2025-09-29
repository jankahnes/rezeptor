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
      class="h-28 xs:h-34 aspect-square object-cover bg-transparent [filter:drop-shadow(0_0_8px_var(--tw-shadow-color))_drop-shadow(0_0_4px_var(--tw-shadow-color))] relative z-10"
      :class="[getGradeShadow(recipe?.hidx || 0, 'hidx')]"
      :src="recipe?.picture || ''"
    />

    <div class="z-0 flex-1">
      <div
        class="bg-white px-6 py-2 shadow-md rounded-xl min-h-28 xs:min-h-34 flex flex-col gap-3 justify-center flex-1"
        :class="recipe?.picture ? '-ml-16 !pl-20 !pr-6' : ''"
      >
      <div class="w-full flex gap-6 justify-between items-start">
        <h2
          class="font-semibold leading-6 text-xl sm:text-2xl tracking-tight line-clamp-2"
        >
          {{ recipe?.title }}
        </h2>
        <GradeContainer
          v-if="recipe?.hidx && recipe?.hidx >= 55"
          :score="recipe?.hidx || 0"
          type="hidx"
          class="text-base sm:text-lg flex-shrink-0"
        />
      </div>
        <div
          class="flex gap-1.5 flex-wrap text-[0.6em] md:text-[0.4em] max-h-[3.2rem] overflow-hidden items-start"
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
              :id="'card-new-horizontal-' + recipe?.id"
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
