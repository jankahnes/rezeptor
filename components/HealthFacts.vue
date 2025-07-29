<template>
  <div class="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
    <div class="flex flex-col lg:flex-row gap-8 h-full">
      <div class="flex-1 items-start flex flex-col justify-between">
        <h1 class="text-2xl lg:text-4xl font-bold text-gray-800 mb-4">
          Health Summary
        </h1>
        <div class="flex flex-col gap-3 items-start">
          <div
            v-for="grade of readableGrades"
            :key="grade.description"
            class="flex gap-3 items-center"
            :class="grade.color"
          >
            <span class="material-symbols-outlined !text-2xl">{{
              grade.icon
            }}</span>
            <div class="flex flex-col">
              <span class="font-semibold">{{ grade.description }}</span>
            </div>
          </div>
        </div>
        <button
          v-if="!props.noReport"
          @click="onReport"
          class="button flex items-center gap-2 px-2 py-1 font-medium mt-2 !bg-secondary-500 text-primary-800"
        >
          <span class="material-symbols-outlined text-lg">biotech</span>
          <span>See the full health analysis on this recipe</span>
        </button>
      </div>
      <div class="flex flex-col gap-4">
        <GradeContainer
          :score="props.recipe?.hidx ?? 0"
          :type="'hidx'"
          class="font-bold text-5xl p-4 rounded-xl shadow-sm"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  recipe: RecipeProcessed;
  onReport?: () => void;
  noReport?: boolean;
}>();

const onReport = props.onReport ?? (() => {
  navigateTo(`/recipe/${props.recipe.id}/report`);
});


const recipeStore = useRecipeStore();

const readableGrades = gradesToReadable({}, props.recipe);

</script>

<style scoped>

.card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.3s ease;
}
</style>
