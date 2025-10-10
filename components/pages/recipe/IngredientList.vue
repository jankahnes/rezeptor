<template>
  <div class="h-full flex flex-col min-w-92">
    <div class="p-2 md:p-6 !pb-2">
      <div class="flex justify-between items-center w-full mb-4">
        <div
          class="px-4 py-1 bg-primary text-white rounded-lg"
          v-if="!hideHeader"
        >
          <h2 class="text-lg font-bold">INGREDIENTS</h2>
        </div>
        <div class="flex items-center gap-2">
          <button
            class="button flex items-center gap-2 px-2 py-1 font-medium !bg-primary/10 text-primary text-xs"
            @click="copyIngredients"
          >
            <span class="material-symbols-outlined !text-sm">copy_all</span>
            Copy
          </button>
          <transition name="fade-slide" mode="out-in">
            <button
              v-if="notOnDefaultUnits"
              class="button flex items-center gap-2 px-2 py-1 font-medium !bg-primary/10 text-primary text-xs will-change-transform"
              @click="resetUnits"
            >
              <span class="material-symbols-outlined !text-sm">refresh</span>
              <span>Reset Units</span>
            </button>
          </transition>
        </div>
      </div>
      <div class="mb-4" v-if="batchSize && !servingMode">
        <p class="text-gray-600 ml-1 font-light">
          For {{ batchSize }} {{ batchSize === 1 ? 'serving' : 'servings' }}
        </p>
        <p
          @click="servingMode = !servingMode"
          class="text-xs text-gray-400 ml-1 font-extralight cursor-pointer italic"
        >
          Adjust servings
        </p>
      </div>
      <div v-else>
        <p class="text-sm text-gray-600 ml-1 font-light">Servings:</p>
        <FormsSlidingSelector
          v-if="servingSize"
          v-model="servingSize"
          :choices="[0.5, 1, 2, 3, 4, 5, 6, 7, 8]"
          :expanded="false"
          class="max-w-[180px]"
        />
        <p
          v-if="batchSize"
          @click="
            servingMode = !servingMode;
            servingSize = batchSize;
          "
          class="text-xs text-gray-400 ml-1 font-extralight cursor-pointer mb-4 italic"
        >
          Show ingredients for one batch
        </p>
      </div>
    </div>

    <div class="flex-1 px-2 md:px-6 py-2">
      <div class="max-w-md space-y-4 select-none">
        <template
          v-for="(group, category) in {
            uncategorized: groupedIngredients.uncategorized,
            ...groupedIngredients.categorized,
          }"
          :key="category"
        >
          <div v-if="category !== 'uncategorized' && group.length > 0">
            <h3
              class="text-lg font-semibold text-gray-800 mb-3 border-b border-primary/20 pb-2"
            >
              {{ category }}
            </h3>
          </div>

          <ul
            class="grid grid-cols-[max-content_max-content_1fr] gap-x-1 gap-y-6 ml-2"
            role="list"
          >
            <li
              v-for="ingredient in group"
              :key="ingredient.name"
              class="col-span-3 grid grid-cols-subgrid items-center group space-x-2 relative"
              :class="{
                'ingredient-checked': checkedIngredients.has(ingredient.name),
              }"
            >
              <div class="flex items-center justify-center">
                <input
                  type="checkbox"
                  :checked="checkedIngredients.has(ingredient.name)"
                  @change="toggleIngredientChecked(ingredient.name)"
                  class="w-4 h-4 !accent-primary rounded"
                />
              </div>
              <transition name="fade-slide" mode="out-in">
                <span
                  :key="`${servingSize}-${ingredient?.currentUnit}`"
                  class="tabular-nums whitespace-nowrap font-semibold cursor-pointer"
                  @click="onClickIngredient(ingredient)"
                >
                  {{
                    getStringFromAmountInfo(
                      ingredient?.amountInfo?.[ingredient?.currentUnit],
                      servingSize ?? 1
                    )
                  }}
                  <span
                    class="font-light text-xs ml-[2px] text-gray-600"
                    v-if="
                      isCountable(
                        ingredient?.amountInfo?.[ingredient?.currentUnit][1]
                      ) &&
                      unitIsNoun(
                        ingredient?.amountInfo?.[ingredient?.currentUnit][1]
                      )
                    "
                  >
                    of</span
                  >
                </span>
              </transition>

              <NuxtLink :to="`/foods/${ingredient.id}`" class="cursor-pointer">
                <span class="ml-2 text-nowrap whitespace-nowrap">{{
                  getIngredientName(ingredient)
                }}</span>
                <span
                  v-if="ingredient.preparation_description"
                  class="font-light text-xs mt-1 text-gray-600 -ml-1"
                >
                  , {{ ingredient.preparation_description }}
                </span>
              </NuxtLink>
            </li>
          </ul>
        </template>
        <transition name="fade-slide" mode="out-in">
          <button
            v-if="showAddToShoppingList"
            class="button flex items-center gap-2 px-4 py-1 font-medium !bg-primary !text-white will-change-transform mt-6"
            @click="() => {}"
          >
            <span class="material-symbols-outlined !text-lg"
              >add_shopping_cart</span
            >
            Add rest to Shopping List
          </button>
        </transition>
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
const props = defineProps({
  ingredients: Array<any>,
  hideHeader: Boolean,
  batchSize: Number,
  servingSize: Number,
});

const emit = defineEmits(['update:servingSize']);

// Use computed for two-way binding with parent component
const servingSize = computed({
  get: () => props.servingSize,
  set: (value) => emit('update:servingSize', value),
});

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

const servingMode = ref(!props.batchSize);
const checkedIngredients = ref<Set<string>>(new Set());

const showAddToShoppingList = computed(() => {
  return (
    checkedIngredients.value.size > 0 &&
    checkedIngredients.value.size < (props.ingredients?.length ?? 1)
  );
});

const notOnDefaultUnits = computed(() => {
  return props.ingredients?.some(
    (ingredient: any) => ingredient.currentUnit !== 0
  );
});

function getIngredientName(ingredient: any) {
  if (!ingredient?.amountInfo || !ingredient?.amountInfo.length) {
    return ingredient.name;
  }
  const amountInfo = ingredient?.amountInfo?.[ingredient?.currentUnit];
  if (
    isCountable(amountInfo[1]) &&
    amountInfo[0] * (servingSize.value ?? 1) > 1 &&
    !unitIsNoun(amountInfo[1])
  ) {
    return pluralizeWord(ingredient.name);
  }
  return ingredient.name;
}

function toggleIngredientChecked(ingredientName: string) {
  if (checkedIngredients.value.has(ingredientName)) {
    checkedIngredients.value.delete(ingredientName);
  } else {
    checkedIngredients.value.add(ingredientName);
  }
}

function onClickIngredient(ingredient: any) {
  if (ingredient.currentUnit == ingredient.amountInfo.length - 1) {
    ingredient.currentUnit = 0;
  } else {
    ingredient.currentUnit += 1;
  }
}

function copyIngredients() {
  navigator.clipboard.writeText(
    getStringFromIngredients(props.ingredients, servingSize.value ?? 1)
  );
}

function resetUnits() {
  for (const ingredient of props.ingredients || []) {
    ingredient.currentUnit = 0;
  }
}
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.12s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(-5px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(5px);
}

.ingredient-checked::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 30px;
  right: 20px;
  height: 1px;
  background-color: var(--color-primary-600);
  opacity: 0.2;
  transform: translateY(-50%);
  pointer-events: none;
}
</style>
