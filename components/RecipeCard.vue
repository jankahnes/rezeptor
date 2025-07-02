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
      <img
        :src="recipe?.picture_url || ''"
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
        class="absolute bottom-[2%] left-[16%] right-[2%] flex gap-2"
      >
        <div
          class="tag flex items-center justify-center metallic-gradient text-[0.3em]"
          v-for="tag in recipe?.tags?.slice(0, 3)"
        >
          {{ getTagByID(tag.tag_id)?.name }}
        </div>
      </div>
    </div>
    <div
      v-if="!hideTags"
      class="absolute bottom-[2%] left-[2%] right-[2%] flex gap-2"
    >
      <div
        class="text-[0.8em] rounded-xl font-bold w-[2em] aspect-square text-center flex items-center justify-center"
        :class="getGradeClass(recipe?.hidx || 0)"
      >
        {{ getGrade(recipe?.hidx || 0, 'hidx') }}
      </div>
    </div>
  </NuxtLink>
  <Skeleton v-else class="rounded-3xl" />
</template>

<script setup lang="ts">
const props = defineProps<{ recipe: RecipeProcessed; hideTags?: boolean }>();
function getGradeClass(hidx: number) {
  const grade = getGrade(hidx, 'hidx');
  let positiveHalo = '';
  if (grade.startsWith('A')) {
    positiveHalo =
      ' shadow-[0_0_12px_4px] shadow-[#e8fcf2] filter brightness-102';
  } else if (grade.startsWith('S')) {
    positiveHalo =
      ' shadow-[0_0_16px_6px] shadow-[#edf5ff] filter brightness-102';
  } else {
    positiveHalo = 'shadow-sm';
  }
  return gradeColors[getGrade(hidx, 'hidx')] + ' ' + positiveHalo;
}
</script>

<style scoped></style>
