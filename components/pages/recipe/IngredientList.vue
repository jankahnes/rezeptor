<template>
  <div class="p-1 flex flex-col gap-6 items-center">
    <div class="relative mx-auto w-full flex justify-center">
      <HandDrawnBorder
        class="header flex items-center text-center px-10 xl:px-14 mx-auto justify-center rounded-lg p-2 overflow-visible"
        :stroke-color="'#77f77b'"
        :stroke-width="1"
        :bg-color="'#fdf5ea'"
        :roughness="1"
        :blur="0.2"
      >
        <div
          class="tape absolute -top-3 -right-12 w-8 h-4 bg-gray-200 opacity-90 transform -rotate-6"
        ></div>
        <div
          class="tape absolute -top-3 -left-12 w-8 h-4 bg-gray-200 opacity-90 transform rotate-6"
        ></div>
        <h1 class="text-2xl font-bold">Ingredients</h1>
      </HandDrawnBorder>
    </div>
    <div
      class="flex flex-col rounded-lg px-2 py-6 z-15 sm:border-2 border-gray-300 w-[clamp(300px,600px,100%)]"
    >
      <div class="pt-4 w-55 items-center mx-auto">
        <FormsSlidingSelector
          v-model="servingSize"
          class=""
          :choices="[0.5, 1, 2, 3, 4, 5, 6, 7, 8]"
          :expanded="false"
        />
        <p class="text-sm text-center">Servings</p>
      </div>

      <ul class="space-y-1 md:px-8 px-4 py-4 text-lg">
        <template
          v-for="(group, category) in {
            uncategorized: groupedIngredients.uncategorized,
            ...groupedIngredients.categorized,
          }"
          :key="category"
        >
          <li v-if="category !== 'uncategorized'" class="pt-2 -mb-[1px]">
            <h3 class="font-semibold underline">{{ category }}</h3>
          </li>
          <li
            v-for="ingredient in group"
            :key="ingredient.name"
            :class="category === 'uncategorized' ? 'mt-1' : ''"
            class="flex items-center justify-between"
          >
            <div>
              {{ ingredient?.name }}
            </div>
            <span
              class="font-bold mr-3 select-none"
              @click="onClickIngredient(ingredient)"
            >
              <transition name="fade-slide" mode="out-in">
                <span :key="`${servingSize}-${ingredient?.currentUnit}`">
                  {{
                    getStringFromAmountInfo(
                      ingredient?.amountInfo?.[ingredient?.currentUnit],
                      servingSize,
                      ingredient?.unit_name
                    )
                  }}
                </span>
              </transition>
            </span>
          </li>
        </template>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const props = defineProps({ ingredients: Array<Object> });
const servingSize = ref(1);

function onClickIngredient(ingredient) {
  if (ingredient.currentUnit == ingredient.amountInfo.length - 1) {
    ingredient.currentUnit = 0;
  } else {
    ingredient.currentUnit += 1;
  }
}

const groupedIngredients = computed(() => {
  const uncategorized = [];
  const categorized = {};

  for (const ingredient of props.ingredients || []) {
    const category = ingredient.category;
    if (!category) {
      uncategorized.push(ingredient);
    } else {
      if (!categorized[category]) {
        categorized[category] = [];
      }
      categorized[category].push(ingredient);
    }
  }

  return { uncategorized, categorized };
});
</script>

<style scoped>
.header {
  filter: drop-shadow(3px 4px 8px rgba(0, 0, 0, 0.1));
}

.tape {
  background: linear-gradient(
    45deg,
    rgb(229, 231, 235) 0%,
    rgb(209, 213, 219) 50%,
    rgb(229, 231, 235) 100%
  );
  border-radius: 1px;
  filter: drop-shadow(rgba(0, 0, 0, 0.1) 1px 1px 2px);
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
  display: inline-block;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(-5px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(5px);
}
</style>
