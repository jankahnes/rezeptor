<template>
  <div class="h-full flex flex-col min-w-92">
    <div class="p-6 pb-4">
      <h2 class="text-xl font-bold text-gray-900 mb-2 ml-1">INGREDIENTS</h2>
      <p class="text-sm text-gray-600 ml-1 font-light">Servings:</p>
      <FormsSlidingSelector
        v-model="servingSize"
        :choices="[0.5, 1, 2, 3, 4, 5, 6, 7, 8]"
        :expanded="false"
        class="max-w-[150px]"
      />
    </div>

    <div class="flex-1 px-6 pb-6">
      <div class="max-w-md mx-auto space-y-6">
        <template
          v-for="(group, category) in {
            uncategorized: groupedIngredients.uncategorized,
            ...groupedIngredients.categorized,
          }"
          :key="category"
        >
          <div
            v-if="category !== 'uncategorized' && group.length > 0"
            class="pt-4 first:pt-0"
          >
            <h3
              class="text-lg font-semibold text-gray-800 mb-3 border-b border-primary-200 pb-2"
            >
              {{ category }}
            </h3>
          </div>

          <div class="">
            <div
              v-for="ingredient in group"
              :key="ingredient.name"
              class="flex items-center p-3 cursor-pointer group"
              @click="onClickIngredient(ingredient)"
            >
              <transition name="fade-slide" mode="out-in">
                <span
                  :key="`${servingSize}-${ingredient?.currentUnit}`"
                  class="select-none group-hover:text-gray-900 transition-colors"
                >
                  {{
                    getStringFromAmountInfo(
                      ingredient?.amountInfo?.[ingredient?.currentUnit],
                      servingSize,
                      ingredient?.unit_name
                    )
                  }}
                </span>
              </transition>
              <span class="font-semibold ml-2 text-nowrap">{{
                ingredient?.name
              }}</span>
              <span
                v-if="ingredient.preperation_description"
                class="font-light text-xs mt-1"
              >
                , {{ ingredient.preperation_description }}
              </span>
            </div>
          </div>
        </template>

        <div
          v-if="!props.ingredients || props.ingredients.length === 0"
          class="text-center py-12"
        >
          <div
            class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center"
          >
            <span class="material-symbols-outlined text-2xl text-gray-400"
              >shopping_cart</span
            >
          </div>
          <h3 class="text-lg font-medium text-gray-700 mb-2">
            No Ingredients Listed
          </h3>
          <p class="text-sm text-gray-500">
            Ingredients for this recipe haven't been added yet.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const props = defineProps({ ingredients: Array<any> });
const servingSize = ref(2);

function onClickIngredient(ingredient: any) {
  if (ingredient.currentUnit == ingredient.amountInfo.length - 1) {
    ingredient.currentUnit = 0;
  } else {
    ingredient.currentUnit += 1;
  }
}

const groupedIngredients = computed(() => {
  const uncategorized: any[] = [];
  const categorized: Record<string, any[]> = {};

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
  transition: all 0.1s ease;
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
