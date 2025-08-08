<template>
  <NuxtLink
    v-if="recipe.id"
    :to="'/recipe/' + recipe?.id"
    class="flex flex-col gap-1 hover:translate-y-[-2px] transition-all duration-300"
  >
    <div
      class="w-full h-[75%] bg-cover bg-center shadow-md rounded-xl flex flex-col justify-end p-1 sm:p-2"
      :style="{ backgroundImage: `url(${recipe?.picture || ''})` }"
    >
      <div class="flex justify-between items-end">
        <GradeContainer
          :score="recipe?.hidx || 0"
          v-if="recipe?.hidx && recipe?.hidx > 56"
          type="hidx"
          class="text-[0.9em] sm:text-[0.75em] font-bold"
        />
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
            :star-width="10"
            :star-height="10"
            :select="false"
            :id="'card-' + recipe?.id"
          />
          <span class="text-[10px]">{{ recipe?.rating.toFixed(1) }}</span>
        </div>
      </div>
    </div>
    <h2 class="font-bold leading-tight mt-1 text-2xl tracking-tight">
      {{ recipe?.title }}
    </h2>
    <div class="flex gap-1 flex-wrap mt-1">
      <div
        class="tag flex items-center justify-center text-[0.4em] text-nowrap"
        :class="tag?.background"
        v-for="(tag, index) in top3Tags"
        :key="index"
      >
        {{ tag?.descriptor }}
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
  if (recipe.price && recipe.price < 1) {
    const tagById = getTagByID(4);
    if (tagById) {
      tagsWithDescriptors.push({
        ...tagById,
        ...getTagDescriptor(4, recipe),
      });
    }
  }
  tagsWithDescriptors.sort((a, b) => (b?.value ?? 0) - (a?.value ?? 0));
  const cropped = tagsWithDescriptors.slice(0, 3);
  return cropped;
};

const top3Tags = ref(getTop3Tags(props.recipe));
</script>

<style scoped></style>
