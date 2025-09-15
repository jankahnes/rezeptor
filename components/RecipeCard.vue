<template>
  <NuxtLink
    v-if="recipe.id"
    :to="'/recipe/' + recipe?.id"
    class="flex flex-col gap-1 hover:translate-y-[-2px] transition-all duration-300 mr-2 items-center"
    :class="{ 'flex-row gap-6 w-full': horizontal }"
  >
    <NuxtImg
      class="w-full aspect-square object-cover bg-transparent rounded-full [filter:drop-shadow(0_0_8px_var(--tw-shadow-color))_drop-shadow(0_0_4px_var(--tw-shadow-color))]"
      :class="{
        '!w-40 !h-40 shrink-0': horizontal,
        [getGradeShadow(recipe?.hidx || 0, 'hidx')]: true,
      }"
      :src="recipe?.picture || ''"
    >
    </NuxtImg>
    <div
      class="flex flex-col gap-1 items-center"
      :class="{ 'mt-4 flex-1 items-start': horizontal }"
    >
      <h2 class="font-bold leading-6 mt-1 text-2xl tracking-tighter text-center">
        {{ recipe?.title }}
      </h2>
      <div
        class="flex gap-1 flex-wrap mt-1 text-[0.6em] md:text-[0.4em]"
        :class="{ 'justify-center': !horizontal }"
      >
        <div
          class="tag flex items-center gap-1.25"
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
            :id="'card-' + recipe?.id + (horizontal ? '-horizontal' : '')"
          />
          <span class="">{{ recipe?.rating.toFixed(1) }}</span>
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
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{
  recipe: RecipeProcessed;
  horizontal?: boolean;
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
