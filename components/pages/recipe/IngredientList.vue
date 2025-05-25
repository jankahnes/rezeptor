<template>
  <div class="p-1 sticky">
    <div class="bg-[#8a7ca92a] border-b p-2">
      <div class="flex items-center gap-2">
        <span class="material-icons text-black !text-4xl">list</span>
        <span class="text-xl font-bold">Ingredients</span>
      </div>
      <div class="w-full py-2 flex items-center gap-5">
        <div
          class="border flex items-center shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
        >
          <button
            v-for="i in [1, 2, 3, 4]"
            :key="i"
            class="bg-white text-black border-r w-9 h-8"
            :class="{ '!bg-black !text-white': servingSize === i }"
            @click="servingSize = i"
          >
            {{ i }}
          </button>
          <button class="bg-white w-8 h-8">
            <span class="material-icons text-black !text-2xl">
              arrow_drop_down
            </span>
          </button>
        </div>
        <span>Servings</span>
      </div>
    </div>

    <ul class="p-4 text-base space-y-1">
      <template v-if="groupedIngredients.uncategorized.length">
        <li
          v-for="ingredient in groupedIngredients.uncategorized"
          :key="ingredient.name"
          class="mt-3"
        >
          <span
            class="font-bold mr-3 select-none"
            @click="onClickIngredient(ingredient)"
          >
            {{
              Number(
                (
                  ingredient?.amountInfo?.[ingredient?.currentUnit]?.[0] *
                  servingSize
                ).toFixed(1)
              )
            }}
            {{ ingredient?.amountInfo?.[ingredient?.currentUnit]?.[1] }}
          </span>
          {{ ingredient?.name }}
        </li>
      </template>

      <template
        v-for="(group, category) in groupedIngredients.categorized"
        :key="category"
      >
        <li class="pt-2 -mb-[1px]">
          <h3 class="font-semibold underline">{{ category }}</h3>
        </li>
        <li v-for="ingredient in group" :key="ingredient.name" class="">
          <span
            class="font-bold mr-3 select-none"
            @click="onClickIngredient(ingredient)"
          >
            {{
              Number(
                (
                  ingredient?.amountInfo?.[ingredient?.currentUnit]?.[0] *
                  servingSize
                ).toFixed(1)
              )
            }}
            {{ ingredient?.amountInfo?.[ingredient?.currentUnit]?.[1] }}
          </span>
          {{ ingredient?.name }}
        </li>
      </template>
    </ul>
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
