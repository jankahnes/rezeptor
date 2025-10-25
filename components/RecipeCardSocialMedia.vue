<template>
  <div
    class="flex flex-row items-stretch transition-all duration-300 shadow-md rounded-xl overflow-hidden flex-1"
  >
    <a
      :href="recipe.source ?? undefined"
      target="_blank"
      class="w-1/3 xs:w-auto flex-shrink-0 my-auto xs:my-0"
    >
      <NuxtImg
        v-if="recipe.social_picture"
        class="w-full xs:w-auto aspect-9/16 xs:h-full object-cover"
        :src="recipe.social_picture"
        loading="lazy"
        fetchpriority="low"
        decoding="async"
        referrerpolicy="no-referrer"
      />
    </a>
    <NuxtLink
      :to="'/recipe/' + recipe.id"
      class="z-0 flex-1 h-full flex flex-col px-6 py-2"
    >
      <div class="flex flex-col gap-3 justify-center flex-1">
        <h2
          class="font-semibold leading-6 text-xl xs:text-2xl tracking-tight line-clamp-2"
        >
          {{
            recipe.original_title && !recipe.source?.includes('instagram')
              ? recipe.original_title
              : recipe.title
          }}
        </h2>
        <p class="text-xs text-gray-500 line-clamp-3">
          {{ recipe.description }}
        </p>
        <div
          class="gap-1.5 flex-wrap text-xs items-start py-0.5 hidden xs:flex"
        >
          <div
            v-if="recipe.hidx && recipe.hidx >= 55"
            class="flex tag items-center !text-black shadow-sm text-center min-w-[2em] subpixel-antialiased tabular-nums justify-center"
            :class="gradeColors[getGrade(recipe.hidx, 'ovr')]"
          >
            {{ getGrade(recipe.hidx, 'ovr') }}
          </div>
          <div
            v-if="recipe.rating && recipe.rating >= 4"
            class="tag flex items-center gap-1 shadow-sm"
          >
            <FormsRatingField
              :model-value="recipe.rating"
              :star-width="13"
              :star-height="13"
              :select="false"
              :id="'card-new-horizontal-' + recipe.id"
            />
            <span>{{ recipe.rating.toFixed(1) }}</span>
          </div>

          <div
            class="tag flex items-center justify-center text-nowrap shadow-sm"
            v-for="(tag, index) in top5Tags"
            :key="index"
          >
            {{ tag?.name }}
          </div>
        </div>
      </div>
      <div class="flex gap-2 items-center flex-wrap sm:flex-nowrap mb-2">
        <PagesRecipeSourceTypeTag
          class="inline-flex !rounded-full text-xs flex-shrink-0"
          :sourceType="recipe.source_type"
          :collection="recipe.collection ?? ''"
          :source="recipe.source ?? ''"
          :small="true"
        />
        <div
          class="flex items-center px-2 rounded-full text-xs font-medium bg-primary-20 gap-2 max-w-50 sm:max-w-70"
          v-if="recipe.original_creator_channel_name"
        >
          <span class="material-symbols-outlined !text-sm flex-shrink-0"
            >favorite</span
          >
          <span class="flex-shrink-0">Creator:</span>
          <span class="truncate">{{
            recipe.original_creator_channel_name
          }}</span>
        </div>
      </div>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  recipe: RecipeOverview;
}>();

const recipeStore = useRecipeStore();

const getTop5Tags = (recipe: RecipeOverview) => {
  if (!recipe.tags) return [];
  const tags = recipe.tags.map((tag) => getTagByID(tag));
  tags.sort((a, b) => (b?.value ?? 0) - (a?.value ?? 0));
  const cropped = tags.slice(0, 5);
  return cropped;
};

onMounted(async () => {
  props.recipe.social_picture = await recipeStore.getSocialPicture(props.recipe.source ?? '');
});

const top5Tags = ref();

watchEffect(() => {
  top5Tags.value = getTop5Tags(props.recipe);
});
</script>

<style scoped></style>
