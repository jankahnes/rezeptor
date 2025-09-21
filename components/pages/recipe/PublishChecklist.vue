<template>
  <div>
    <div class="flex flex-col gap-4 p-2 md:p-6 !pb-3 md:w-3xl">
      <div class="px-4 py-1 bg-primary text-white rounded-lg inline-flex w-fit">
        <h2 class="text-lg font-bold">PUBLISH</h2>
      </div>
      <div
        v-if="recipe.visibility === 'PUBLIC'"
        class="flex gap-2 items-center opacity-60"
      >
        <span class="material-symbols-outlined !text-2xl"> check </span>
        <span class="text-lg flex-1">Your recipe is public!</span>
      </div>
      <div class="flex flex-col gap-3" v-else>
        <div class="max-w-md">
          <p class="text-lg">Your recipe is unlisted.</p>
          <p class="text-xs text-gray-500">
            Your recipe is still visible to others through your profile, but not
            in search results and recommendations.
          </p>
        </div>
        <div
          class="flex gap-2 items-center flex-wrap gap-y-1 mt-4"
          :class="{ 'opacity-50': hasInstructions }"
        >
          <span class="material-symbols-outlined !text-2xl">
            {{ hasInstructions ? 'check' : 'arrow_forward' }}
          </span>
          <span class="text-[18px] flex-1 text-nowrap"
            >Add cooking instructions</span
          >
          <div class="flex gap-2 items-center flex-wrap">
            <button
              class="button px-2 py-1 flex gap-2 items-center text-primary outline-1 outline-primary"
              v-if="!hasInstructions"
            >
              <span class="material-symbols-outlined"> auto_awesome </span>
              <span>Generate</span>
            </button>
            <button
              class="button px-2 py-[5px] flex gap-2 items-center !text-white !bg-primary"
              v-if="!hasInstructions"
            >
              <span class="material-symbols-outlined"> edit </span>
              <span>Add</span>
            </button>
          </div>
        </div>
        <div
          class="flex gap-2 items-center flex-wrap gap-y-1"
          :class="{ 'opacity-50': hasPicture }"
        >
          <span class="material-symbols-outlined !text-2xl">
            {{ hasPicture ? 'check' : 'arrow_forward' }}
          </span>
          <span class="text-[18px] flex-1 text-nowrap mr-4">Add picture</span>
          <div class="flex gap-2 items-center flex-wrap">
            <button
              class="button px-2 py-1 flex gap-2 items-center text-primary outline-1 outline-primary"
              v-if="!hasPicture"
            >
              <span class="material-symbols-outlined"> auto_awesome </span>
              <span>Generate</span>
            </button>
            <button
              class="button px-2 py-1 flex gap-2 items-center text-primary outline-1 outline-primary"
              v-if="!hasPicture"
            >
              <span class="material-symbols-outlined"> file_upload </span>
              <span>Upload</span>
            </button>

            <button
              class="button px-2 py-[5px] flex gap-2 items-center !text-white !bg-primary"
              v-if="!hasPicture"
            >
              <span class="material-symbols-outlined"> image </span>
              <span>Take picture</span>
            </button>
          </div>
        </div>
        <div class="md:hidden border-t border-gray-200 mt-2"></div>
        <div class="flex gap-2 items-center flex-wrap-reverse mt-2 md:mt-4">
          <button
            class="button px-2 py-1 flex gap-2 items-center text-primary outline-1 outline-primary disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="hasInstructions && hasPicture"
          >
            <span class="material-symbols-outlined"> auto_awesome </span>
            <span>Generate & Publish</span>
          </button>
          <button
            class="button px-2 py-[5px] flex gap-2 items-center !text-white !bg-primary disabled:cursor-not-allowed disabled:!bg-gray-500"
            :disabled="!hasInstructions || !hasPicture"
          >
            <span class="material-symbols-outlined">
              keyboard_double_arrow_up
            </span>
            <span>Publish</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  recipe: RecipeProcessed;
}>();

const hasInstructions = computed(() => {
  return Boolean(
    props.recipe?.instructions && props.recipe.instructions.length > 0
  );
});

const hasPicture = computed(() => {
  return Boolean(props.recipe?.picture);
});
</script>

<style scoped></style>
