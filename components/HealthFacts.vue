<template>
  <div class="p-6 bg-white rounded-2xl">
    <div class="flex flex-col lg:flex-row gap-8 h-full">
      <div class="flex-1 items-start flex flex-col justify-between">
        <h1 class="text-xl font-bold text-gray-800">HEALTH SUMMARY</h1>
        <button
          v-if="!props.noReport"
          @click="onReport"
          class="button flex items-center gap-2 px-2 py-1 font-medium !bg-primary-50 text-xs mt-2"
        >
          <span class="material-symbols-outlined !text-sm">open_in_new</span>
          <span>Full Health Report</span>
        </button>
        <div class="flex flex-col gap-3 items-start mt-8">
          <div
            v-for="grade of readableGrades"
            :key="grade.description"
            class="flex gap-3 items-center py-1 px-2 rounded-lg"
            :class="`${grade.bgColor} ${grade.color}`"
          >
            <span class="material-symbols-outlined !text-xl">{{
              grade.icon
            }}</span>
            <div class="flex flex-col">
              <span class="font-semibold text-sm">{{ grade.description }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="flex flex-col gap-4">
        <GradeContainer
          :score="props.recipe?.hidx ?? 0"
          :type="'hidx'"
          class="font-bold text-4xl p-4 rounded-xl shadow-sm"
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

const onReport =
  props.onReport ??
  (() => {
    navigateTo(`/recipe/${props.recipe.id}/report`);
  });

const recipeStore = useRecipeStore();

const readableGrades = gradesToReadable({}, props.recipe).filter(
  (grade) => grade.value >= 4
);
</script>

<style scoped>
.card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.3s ease;
}
</style>
