<template>
  <NuxtLink
    v-if="recipe.id"
    :to="'/recipe/' + recipe?.id"
    class="shadow rounded-lg flex flex-col hover-shine p-4 pb-6 relative"
    :class="
      recipe.title == 'Salmon Pasta'
        ? 'golden-gradient golden-overlay'
        : 'metallic-gradient'
    "
  >
    <h2 class="font-bold mb-4">
      {{ recipe?.title }}
    </h2>
    <div class="flex-grow rounded-lg overflow-hidden relative">
      <NuxtImg
        :src="recipe?.picture || ''"
        class="w-full h-full object-cover"
      />
      <div
        v-if="!hideTags"
        class="absolute top-[2%] left-[2%] right-[2%] flex gap-2"
      >
        <div
          class="tag flex items-center gap-1 golden-gradient"
          v-if="recipe?.title?.startsWith('K')"
        >
          <span class="material-symbols-outlined"> local_fire_department </span>
          <span class="text-sm">Trending</span>
        </div>
        <div
          class="tag flex items-center gap-1"
          :class="
            recipe?.rating && recipe?.rating >= 4.5
              ? 'golden-gradient'
              : 'platinum-gradient'
          "
          v-if="recipe?.rating && recipe?.rating >= 4"
        >
          <FormsRatingField
            :model-value="recipe?.rating"
            :star-width="12"
            :star-height="12"
            :select="false"
            :id="'card-' + recipe?.id"
          />
          <span class="text-xs">{{ recipe?.rating.toFixed(1) }}</span>
        </div>
      </div>
      <div
        v-if="!hideTags"
        :class="
          recipe?.hidx && recipe?.hidx > 56
            ? ' bottom-[2%] left-[16%] w-[calc(100%-1.8em)] '
            : 'bottom-[2%] left-[2%]'
        "
        class="flex gap-2 absolute flex-wrap justify-end"
      >
        <div
          class="tag flex items-center justify-center text-[0.3em] text-nowrap"
          :class="tag?.background"
          v-for="(tag, index) in top3Tags"
        >
          {{ tag?.descriptor }}
        </div>
      </div>
    </div>
    <div
      v-if="!hideTags && recipe?.hidx && recipe?.hidx > 56"
      class="absolute bottom-[2%] left-[2%] right-[2%] flex gap-2"
    >
      <GradeContainer
        :score="recipe?.hidx || 0"
        type="hidx"
        class="text-[0.8em] rounded-xl font-bold"
      />
    </div>
  </NuxtLink>
  <Skeleton v-else class="rounded-3xl" />
</template>

<script setup lang="ts">
const props = defineProps<{ recipe: RecipeProcessed; hideTags?: boolean }>();

const getTop3Tags = (recipe: RecipeProcessed) => {
  const tags = recipe.tags.map((tag) => getTagByID(tag.tag_id));
  const tagsWithDescriptors = tags.map((tag) => {
    if (tag) {
      return { ...tag, ...getTagDescriptor(tag.id, recipe) };
    }
    return null;
  });
  if (recipe.price && recipe.price < 1) {
    tagsWithDescriptors.push({
      ...getTagDescriptor(4, recipe),
      ...getTagByID(4),
    });
  }
  tagsWithDescriptors.sort((a, b) => (b?.value ?? 0) - (a?.value ?? 0));
  const cropped = tagsWithDescriptors.slice(0, 3);
  return cropped;
};

const top3Tags = ref(getTop3Tags(props.recipe));
</script>

<style scoped></style>
