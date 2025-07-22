<template>
  <div class="p-1 flex flex-col items-center">
    <div class="relative mx-auto w-full flex justify-center">
      <div
        class="header flex items-center text-center px-10 xl:px-14 mx-auto justify-center rounded-lg p-2 overflow-visible"
      >
        <h1 class="text-3xl font-bold">Ingredients</h1>
      </div>
    </div>
    <div
      class="flex flex-col rounded-lg px-2 py-6 z-15 w-[clamp(300px,600px,100%)]"
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
