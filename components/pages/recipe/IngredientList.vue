<template>
  <div
    class="h-full flex flex-col min-w-92 relative rounded-xl pb-4"
    :class="{ '!bg-primary-20/80 overflow-hidden': formalizationLoading }"
  >
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
          <button
            v-if="displayFormalize"
            class="button flex items-center gap-2 px-2 py-1 font-medium !bg-primary/10 text-primary text-xs will-change-transform"
            @click="formalize()"
          >
            <span class="material-symbols-outlined !text-sm">auto_awesome</span>
            <span>Analyze</span>
          </button>
        </div>
      </div>
      <div v-if="ingredients && ingredients.length > 0">
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
            :choices="[0.5, 1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 16, 18, 20]"
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
    </div>

    <div class="flex-1 px-2 md:px-6 py-2">
      <div
        class="max-w-md space-y-4 select-none"
        v-if="ingredients && ingredients.length > 0"
      >
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
            class="grid grid-cols-[max-content_max-content_1fr] gap-x-1 gap-y-5 ml-2"
            role="list"
          >
            <li
              v-for="ingredient in group"
              :key="ingredient.name"
              class="col-span-3 grid grid-cols-subgrid items-center group space-x-2 relative"
            >
              <div class="flex items-center justify-center">
                <input
                  type="checkbox"
                  :checked="checkedIngredients.has(ingredient.name)"
                  @change="toggleIngredientChecked(ingredient.name)"
                  class="w-4 h-4 !accent-primary rounded"
                />
              </div>
              <Transition name="fade-slide" mode="out-in">
                <span
                  :key="`${servingSize}-${ingredient?.currentUnit}`"
                  class="tabular-nums whitespace-nowrap font-bold cursor-pointer"
                  @click="onClickIngredient(ingredient)"
                >
                  {{
                    getStringFromAmountInfo(
                      ingredient?.amountInfo?.[ingredient?.currentUnit],
                      servingSize ?? 1
                    )
                  }}
                  <span
                    class="font-light text-sm text-gray-600 italic"
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
              </Transition>

              <NuxtLink :to="`/foods/${ingredient.id}`" class="cursor-pointer">
                <span class="text-nowrap whitespace-nowrap font-medium">{{
                  getIngredientName(ingredient)
                }}</span>
              <span
              v-if="ingredient.preparation_description"
              class="font-light text-gray-600 text-sm italic -ml-1 mt-1"
              >, {{ ingredient.preparation_description }}
            </span>
          </NuxtLink>
            </li>
          </ul>
        </template>
        <Transition name="fade-slide" mode="out-in">
          <button
            v-if="checkedIngredients.size > 0"
            class="button flex items-center gap-2 px-4 py-1 font-medium !bg-primary !text-white will-change-transform mt-6"
            @click="addToShoppingList"
          >
            <span class="material-symbols-outlined !text-lg"
              >add_shopping_cart</span
            >
            Add to Shopping List
          </button>
        </Transition>
        <div class="flex gap-2 items-center flex-wrap">
          <div
            class="flex gap-2 items-center bg-primary-20 rounded-xl px-2"
            v-if="addedInfo?.addedFat && getAdded(addedInfo?.addedFat) >= 1"
          >
            <span class="material-symbols-outlined !text-lg">water_drop</span>
            <span class="text-xs font-medium"
              >Plus estimated ~{{ getAdded(addedInfo?.addedFat) }}g of fat</span
            >
          </div>
          <div
            class="flex gap-2 items-center bg-primary-20 rounded-xl px-2"
            v-if="
              addedInfo?.addedSalt && getAdded(addedInfo?.addedSalt) >= 0.75
            "
          >
            <span class="material-symbols-outlined !text-lg">grain</span>
            <span class="text-xs font-medium"
              >Plus estimated ~{{ getAdded(addedInfo?.addedSalt) }}g of
              salt</span
            >
          </div>
        </div>
      </div>
      <!-- No formal ingredients, display base ingredients-->
      <div v-else class="flex flex-col">
        <div v-for="baseIngredient in baseIngredients" :key="baseIngredient">
          <p class="ml-1 font-light leading-relaxed text-base tracking-wider">
            {{ baseIngredient }}
          </p>
        </div>
      </div>
    </div>
    <div
      class="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/70 to-transparent p-4 pointer-events-none"
      v-if="formalizationLoading"
    />
  </div>
</template>

<script setup lang="ts">
type AddedInfo = {
  addedFat: number;
  addedSalt: number;
  batchSize: number;
};
const props = defineProps({
  ingredients: Array<any>,
  baseIngredients: Array<string>,
  hideHeader: Boolean,
  batchSize: Number,
  servingSize: Number,
  recipeId: Number,
  formalizationLoading: Boolean,
  displayFormalize: Boolean,
  formalize: { type: Function as PropType<() => void>, required: true },
  addedInfo: Object as PropType<AddedInfo>,
});

const getAdded = (added: number) => {
  return Math.round(
    ((servingSize.value ?? 1) * added) / (props.batchSize ?? 1)
  );
};

const emit = defineEmits(['update:servingSize']);

const authStore = useAuthStore();

const { track } = useEngagement();

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
  track(props.recipeId, 'copy');
  navigator.clipboard.writeText(
    getStringFromIngredients(props.ingredients, servingSize.value ?? 1)
  );
}

function resetUnits() {
  for (const ingredient of props.ingredients || []) {
    ingredient.currentUnit = 0;
  }
}

async function addToShoppingList() {
  if (!props.recipeId) return;

  if (checkedIngredients.value.size > 0 && props.ingredients) {
    const ingredients = props.ingredients.filter((ingredient: any) =>
      checkedIngredients.value.has(ingredient.name)
    );
    checkedIngredients.value.clear();
    await authStore.addToShoppingList(
      ingredients,
      props.recipeId,
      props.servingSize ?? 1
    );
    track(props.recipeId, 'shopping_list');
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
</style>
