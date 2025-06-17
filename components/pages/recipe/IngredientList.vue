<template>
  <div class="p-1 flex flex-col gap-6 font-[Caveat_Brush] text-xl">
    <div class="relative mx-auto w-full flex justify-center">
      <HandDrawnBorder
        class="flex items-center text-center px-10 xl:px-14 mx-auto justify-center rounded-lg p-2 overflow-visible"
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
        <h1 class="text-3xl font-bold">Ingredients</h1>
      </HandDrawnBorder>
    </div>
    <HandDrawnBorder
      class="flex flex-col rounded-lg p-4 transform transition-transform duration-300 hover:scale-101 hover:rotate-[0.3deg]"
      strokeColor="#77f77b"
      :strokeWidth="1"
      bgColor="#fdf5ea"
      :roughness="0.7"
      :blur="0.7"
    >
      <div class="pt-4 w-55 items-center mx-auto">
        <FormsSlidingSelector
          v-model="servingSize"
          class="font-[Inconsolata]"
          :choices="[0.5, 1, 2, 3, 4, 5, 6, 7, 8]"
          :expanded="false"
        />
        <p class="text-sm text-center">Servings</p>
      </div>

      <ul class="space-y-1 p-4 text-xl">
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
                <span :key="servingSize">
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
    </HandDrawnBorder>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const props = defineProps({ ingredients: Array<Object> });
const servingSize = ref(2);

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
.relative {
  filter: drop-shadow(3px 4px 8px rgba(0, 0, 0, 0.15));
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
  transition: all 0.3s ease;
  display: inline-block;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(10px);
}
</style>
