<template>
  <div class="action-card action-card-padding flex-[1_1_22rem]">
    <div class="flex flex-col lg:flex-row gap-8 h-full">
      <div class="flex-1 items-start flex flex-col">
        <div class="flex justify-between items-start w-full flex-wrap gap-4">
          <div>
            <ComponentHeader title="HEALTH SUMMARY" />
            <button
              @click="onReport"
              class="button flex items-center gap-2 px-2 font-medium bg-primary! text-xs mt-3 text-white"
            >
              <span class="material-symbols-outlined !text-lg"
                >open_in_new</span
              >
              <span>Full Insights</span>
            </button>
          </div>
          <GradeContainer
            :score="props.recipe?.hidx ?? 0"
            :type="'ovr'"
            class="font-bold text-4xl p-4 rounded-xl shadow-sm"
          />
        </div>

        <div class="flex flex-col gap-3 items-start mt-6">
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
      <div class="flex flex-col gap-4"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  recipe: Recipe | FullFoodRow | InsertableRecipe;
  onReport?: () => void;
  isFood?: boolean;
}>();

const onReport =
  props.onReport ??
  (() => {
    navigateTo(
      `/${props.isFood ? 'foods' : 'recipe'}/${props.recipe.id}/report`
    );
  });

const readableGrades = gradesToReadable({}, props.recipe, props.isFood).filter(
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
