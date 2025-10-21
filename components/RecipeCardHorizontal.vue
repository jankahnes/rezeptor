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
        </div>
        <div
          class="flex gap-1.5 flex-wrap text-[0.6em] md:text-[0.4em] max-h-[3.4rem] overflow-hidden items-start py-0.5"
        >
          <div
            v-if="recipe?.hidx && recipe?.hidx >= 55"
            class="flex tag items-center !text-black shadow-sm w-[2em] text-center"
            :class="gradeColors[getGrade(recipe?.hidx, 'ovr')]"
          >
            {{ getGrade(recipe?.hidx, 'ovr') }}
          </div>
          <div
            v-if="recipe?.rating && recipe?.rating >= 4"
            class="tag flex items-center gap-1"
            :class="
              recipe?.rating && recipe?.rating >= 4.5
                ? 'golden-gradient-muted'
                : 'shadow-sm'
            "
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

const getTop3Tags = (recipe: RecipeOverview) => {
  const tags = recipe.tags.map((tag) => getTagByID(tag));
  tags.sort((a, b) => (b?.value ?? 0) - (a?.value ?? 0));
  const cropped = tags.slice(0, 3);
  return cropped;
};

const top3Tags = ref(getTop3Tags(props.recipe));
</script>

<style scoped></style>
